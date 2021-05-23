require("dotenv").config();
require("./utils/db");
const discord = require("discord.js");
const glob = require("glob");
const Guild = require("./models/guilds");
const { checkNewBuild, checkGiveawayOnStartup, checkReactionValidity } = require("./utils");
const CommandHandler = require("./utils/executeCommand");
const logger = require("./utils/logger");

const bot = new discord.Client({ partials: ["MESSAGE", "REACTION"] });

bot.commands = new discord.Collection();

glob("./commands/**/*.js", function registerCommands(error, files) {
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
    const guildDoc = await Guild.findOne({ _id: guild.id });

    if (!guildDoc) {
      await Guild.create({
        _id: guild.id,
      });

      return false;
    }

    await checkGiveawayOnStartup(bot, guildDoc);
  });

  if (process.env.PUBLIC_ROLES) {
    await roles.execute(bot);
  }

  setInterval(async () => await checkNewBuild(bot), 300000);
});

bot.on("message", async message => {
  await CommandHandler.execute(bot, message);
});

bot.on("messageReactionAdd", async (reaction, author) => {
  const starboard = bot.commands.get("starboard");
  const roles = bot.commands.get("roles");

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
  const starboard = bot.commands.get("starboard");
  const roles = bot.commands.get("roles");

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
