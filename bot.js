const fs = require("fs");
const discord = require("discord.js");
const commandFiles = fs.readdirSync("./commands");
const mongoose = require("mongoose");
const moment = require("moment");
const { Giveaway, Entries, Winner } = require("./dbModels/models");

function createWinner(winner, item) {
  Winner.create({
    userId: winner.userId,
    userName: winner.userName,
    discriminator: winner.discriminator,
    item: item,
  });
}

async function pickWinner() {
  const winner = await Entries.aggregate([{ $sample: { size: 1 } }]);
  return winner[0];
}

function clearGiveawayAndEntries() {
  Giveaway.collection.deleteMany({});
  Entries.collection.deleteMany({});
}

async function endGiveaway(giveaway, channel, item) {
  const winner = await pickWinner();
  if (!winner) {
    channel.send("Looks like no one entered the giveaway :(");
    console.error(`No one entered the giveaway of ${item}.`);
    return clearGiveawayAndEntries();
  }
  createWinner(winner, item);
  console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
  channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${giveaway.userName}#${giveaway.discriminator}!`);
  clearGiveawayAndEntries();
}

// Get an instance of Discord Client
const bot = new discord.Client();

// Register commands
bot.commands = new discord.Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

// Connect to MongoDB, either via env variable or localhost
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
}));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Succesfully connected to database"));

// Do these when bot is ready
bot.on("ready", async () => {
  bot.user.setActivity("Guild Wars 2");
  console.log(`Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`);
  console.log(`Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`);
  console.log(`Bot's presence is set to: ${bot.user.presence.game.name}`);
  console.log(`Bot is in: ${bot.guilds.size} servers`);
  console.log("Awaiting orders...");

  const giveawayChannel = bot.channels.get(process.env.GIVEAWAY_CHANNEL);
  const giveaway = await Giveaway.find({});

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
  const command = bot.commands.get(commandName)
    || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  // Check if command has args and/or usage, reply accordingly
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
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

bot.on("error", error => console.log(error));
process.on("unhandledRejection", error => console.error("Uncaught Promise Rejection", error));

bot.login(process.env.TOKEN);
