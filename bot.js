const glob = require("glob");
const discord = require("discord.js");
const { checkNewBuild, checkGiveawayOnStartup } = require("./utils/general");
const { executeCommand } = require("./utils/executeCommand");
const logger = require("./utils/logger");

const bot = new discord.Client();

bot.commands = new discord.Collection();

glob("./commands/**/*.js", function registerCommands(error, files) {
  files.forEach((file) => {
    const command = require(file);
    bot.commands.set(command.name, command);
  });
});

bot.on("ready", async () => {
  await bot.user.setActivity("Guild Wars 2");

  const logs = [
    `Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`,
    `Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`,
    `Bot's presence is set to: ${bot.user.presence.game.name}`,
    `Bot is in: ${bot.guilds.size} servers`,
    "Awaiting orders...",
  ];

  logs.forEach(function log(msg) {
    logger.verbose(msg);
  });

  await checkGiveawayOnStartup(bot);

  setInterval(async () => await checkNewBuild(bot), 300000);
});

bot.on("message", async message => {
  await executeCommand(bot, message);
});

bot.on("error", error => logger.error("General error:", error));
process.on("unhandledRejection", error => logger.error("Uncaught Promise Rejection:", error));

bot.login(process.env.TOKEN);
