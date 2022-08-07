import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

import "./utils/db";
import { ActivityType, Client, Collection, GatewayIntentBits, InteractionType, Partials } from "discord.js";
import glob from "glob";
import { Guilds } from "@mbacalan/aurene-database";
import { StaticCommand } from "./types";
import { logger, checkGiveawayOnStartup, checkReactionValidity, checkNewBuild } from "./utils";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageTyping
  ],
  partials: [Partials.Message, Partials.Reaction]
});

bot.statics = new Collection();
bot.commands = new Collection();

glob("./commands/statics/**/*.js", { cwd: 'dist' }, (_error, files) => {
  files.forEach((file) => {
    const command = require(file);
    bot.statics.set(command.name, command);
  });
});

glob.sync("./commands/**/*.js", { cwd: 'dist' }).forEach((file) => {
  const command = require(file);
  bot.commands.set(command.name, command);
});

bot.on("ready", async () => {
  const roles = bot.commands.get("roles");

  bot.user.setPresence({ activities: [{ name: "Guild Wars 2", type: ActivityType.Playing }] });

  [
    `Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`,
    `Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`,
    `Bot is in: ${bot.guilds.cache.size} servers`,
    "Awaiting orders...",
  ].forEach((log) => {
    logger.verbose(log);
  });

  bot.guilds.cache.forEach(async (guild) => {
    const guildDoc = await Guilds.findOne({ _id: guild.id });

    if (!guildDoc) {
      await Guilds.create({
        _id: guild.id,
      });

      return false;
    }

    await checkGiveawayOnStartup(bot.channels, guildDoc);
  });

  if (process.env.PUBLIC_ROLES) {
    await roles.execute(bot);
  }

  setInterval(async () => await checkNewBuild(bot.user), 300000);
});

bot.on("interactionCreate", async interaction => {
  if (interaction.type != InteractionType.ApplicationCommand) {
    return;
  }

  const command = bot.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
});

bot.on("messageReactionAdd", async (reaction, author) => {
  const starboard: StaticCommand = bot.statics.get("starboard");
  // const roles: StaticCommand = bot.statics.get("roles");

  const reactionIsValid = await checkReactionValidity(reaction, author);
  // const rolesChannel = bot.channels.cache.get(process.env.ROLES_CHANNEL);

  if (reactionIsValid) {
    await starboard.handleReaction(reaction);
  }

  // if (!author.bot && reaction.message.channel === rolesChannel) {
    // await roles.handleReaction(bot, reaction, author);
  // }
});

bot.on("messageReactionRemove", async (reaction, author) => {
  const starboard: StaticCommand = bot.statics.get("starboard");
  // const roles: StaticCommand = bot.statics.get("roles");

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      logger.error("Something went wrong when fetching the message: ", error);
      return;
    }
  }

  const reactionIsValid = await checkReactionValidity(reaction, author);
  // const rolesChannel = bot.channels.cache.get(process.env.ROLES_CHANNEL);

  if (reactionIsValid) {
    await starboard.handleReaction(reaction, true);
  }

  // if (!author.bot && reaction.message.channel === rolesChannel) {
    // await roles.handleReaction(bot, reaction, author, true);
  // }
});

bot.on("guildCreate", async (guild) => {
  const guildDoc = await Guilds.findOne({ _id: guild.id });

  if (!guildDoc) {
    await Guilds.create({
      _id: guild.id,
    });
  }
});

bot.on("error", (error) => {
  logger.error("General error:", error)
});

bot.login(process.env.TOKEN);

process.on("unhandledRejection", error => logger.error("Uncaught Promise Rejection:", error));
