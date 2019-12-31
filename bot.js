const fs = require("fs");
const discord = require("discord.js");
const mongoose = require("mongoose");
const moment = require("moment");
const commandFiles = fs.readdirSync("./commands");
const { endGiveaway } = require("./utils/general");
const { Giveaway } = require("./dbModels/models");

const bot = new discord.Client();

// Register commands
bot.commands = new discord.Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Succesfully connected to database"));

bot.on("ready", async () => {
  const giveawayChannel = bot.channels.get(process.env.GIVEAWAY_CHANNEL);
  const giveaway = await Giveaway.find({});

  bot.user.setActivity("Guild Wars 2");

  const logs = [
    `Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`,
    `Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`,
    `Bot's presence is set to: ${bot.user.presence.game.name}`,
    `Bot is in: ${bot.guilds.size} servers`,
    "Awaiting orders...",
  ];

  logs.forEach(function log(msg) {
    console.log(msg);
  });

  if (giveaway[0]) {
    const item = giveaway[0].item;
    const timeout = giveaway[0].endTime - moment();

    setTimeout(() => endGiveaway(giveaway[0], giveawayChannel, item), timeout);
  }
});

bot.on("message", message => {
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
    command.execute(message, args);
  } catch (error) {
    console.log(error);
    message.reply("there was an error trying to execute that command!");
  }
});

bot.on("error", error => console.log(error));
process.on("unhandledRejection", error => console.error("Uncaught Promise Rejection", error));

bot.login(process.env.TOKEN);
