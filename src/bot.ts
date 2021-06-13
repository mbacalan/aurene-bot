import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

import "./utils/db";
import discord from "discord.js";
import glob from "glob";
import { Guilds } from "./models/guilds";
import { StaticCommand } from "./types";
import { logger, commandHandler, checkGiveawayOnStartup, checkReactionValidity } from "./utils";

const bot = new discord.Client({ partials: ["MESSAGE", "REACTION"] });

bot.commands = new discord.Collection();

glob("./commands/**/*.js", { cwd: 'build' }, (error, files) => {
  files.forEach((file) => {
    const command = require(file);
    bot.commands.set(command.name, command);
  });
});

bot.on("ready", async () => {
  const roles = bot.commands.get("roles");

  await bot.user.setPresence({ activity: { name: "Guild Wars 2", type: "PLAYING" } });

  [
    `Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`,
    `Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`,
    `Bot's presence is set to: ${bot.user.presence.activities}`,
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

    await checkGiveawayOnStartup(bot, guildDoc);
  });

  if (process.env.PUBLIC_ROLES) {
    await roles.execute(bot);
  }

  // Disabled until related function is fixed
  // setInterval(async () => await checkNewBuild(bot), 300000);
});

bot.on("message", async message => {
  await commandHandler.execute(bot, message);
});

bot.on("messageReactionAdd", async (reaction, author) => {
  const starboard: StaticCommand = bot.commands.get("starboard");
  const roles: StaticCommand = bot.commands.get("roles");

  const reactionIsValid = await checkReactionValidity(bot, reaction, author);
  const rolesChannel = bot.channels.cache.get(process.env.ROLES_CHANNEL);

  if (reactionIsValid) {
    await starboard.handleReaction(bot, reaction);
  }

  if (!author.bot && reaction.message.channel === rolesChannel) {
    await roles.handleReaction(bot, reaction, author);
  }
});

bot.on("messageReactionRemove", async (reaction, author) => {
  const starboard: StaticCommand = bot.commands.get("starboard");
  const roles: StaticCommand = bot.commands.get("roles");

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      return logger.error("Something went wrong when fetching the message: ", error);
    }
  }

  const reactionIsValid = await checkReactionValidity(bot, reaction, author);
  const rolesChannel = bot.channels.cache.get(process.env.ROLES_CHANNEL);

  if (reactionIsValid) {
    await starboard.handleReaction(bot, reaction, true);
  }

  if (!author.bot && reaction.message.channel === rolesChannel) {
    await roles.handleReaction(bot, reaction, author, true);
  }
});

bot.on("error", error => logger.error("General error:", error));
process.on("unhandledRejection", error => logger.error("Uncaught Promise Rejection:", error));

bot.login(process.env.TOKEN);
