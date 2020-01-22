const fs = require("fs");
const discord = require("discord.js");
const moment = require("moment");
const { db } = require("./utils/db");
const commandFiles = fs.readdirSync("./commands");
const { endGiveaway } = require("./utils/general");
const { Giveaway, Build } = require("./dbModels/models");
const logger = require("./utils/logger");
const { buildDbFromApi } = require("./utils/caching");
const { gw2api } = require("./utils/api");

const bot = new discord.Client();

// Register commands
bot.commands = new discord.Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

db.on("error", () => logger.error("Error connecting to database"));
db.once("open", () => logger.info("Successfully connected to database"));

bot.on("ready", async () => {
  setInterval(async function checkNewBuild() {
    const currentBuild = await Build.findOne({});
    const liveBuild = await gw2api.build().get();

    if (!currentBuild) {
      await Build.create({
        build: liveBuild,
      });
    }

    if (currentBuild.build != liveBuild) {
      logger.info("(Re)building API cache");
      await bot.user.setStatus("dnd");
      await bot.user.setActivity("Building API Cache", { type: "LISTENING" });
      await buildDbFromApi();
      await bot.user.setStatus("online");
      await bot.user.setActivity("Guild Wars 2");
    }
    // 5m = 300000ms
  }, 300000);

  const giveawayChannel = bot.channels.get(process.env.GIVEAWAY_CHANNEL);
  const giveaway = await Giveaway.find({});

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

  if (giveaway[0]) {
    const item = giveaway[0].item;
    const timeout = giveaway[0].endTime - moment();

    setTimeout(() => endGiveaway(giveaway[0], giveawayChannel, item), timeout);
  }
});

bot.on("message", async message => {
  // Prefix is either what's defined or the tag of the bot
  const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|\\${process.env.PREFIX})\\s*`);

  if (!prefixRegex.test(message.content) || message.author.bot) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check commands by name and alias
  const command = bot.commands.get(commandName) || bot.commands.find(
    cmd => cmd.aliases && cmd.aliases.includes(commandName)
  );

  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    message.channel.startTyping();

    if (command.init) {
      await command.init(message);
    }

    command.execute(message, args);
    message.channel.stopTyping(true);
  } catch (error) {
    logger.error("Error while executing command", error);
    message.reply("there was an error trying to execute that command!");
  }
});

bot.on("error", error => logger.error("General error:", error));
process.on("unhandledRejection", error => logger.error("Uncaught Promise Rejection:", error));

bot.login(process.env.TOKEN);
