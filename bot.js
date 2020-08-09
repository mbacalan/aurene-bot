const glob = require("glob");
const discord = require("discord.js");
const { checkNewBuild, checkGiveawayOnStartup, checkReactionValidity } = require("./utils/general");
const { executeCommand } = require("./utils/executeCommand");
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

  await bot.user.setActivity("Guild Wars 2");

  [
    `Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`,
    `Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`,
    `Bot's presence is set to: ${bot.user.presence.activities.name}`,
    `Bot is in: ${bot.guilds.size} servers`,
    "Awaiting orders...",
  ].forEach((log) => {
    logger.verbose(log);
  });

  await checkGiveawayOnStartup(bot);

  if (process.env.PUBLIC_ROLES) {
    await roles.execute(bot);
  }

  setInterval(async () => await checkNewBuild(bot), 300000);
});

bot.on("message", async message => {
  await executeCommand(bot, message);
});

bot.on("messageReactionAdd", async (reaction, author) => {
  const starboard = bot.commands.get("starboard");
  const roles = bot.commands.get("roles");

  const reactionIsValid = checkReactionValidity(bot, reaction, author);
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

  const reactionIsValid = checkReactionValidity(bot, reaction, author);
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
