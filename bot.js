const fs = require("fs");
const discord = require("discord.js");
const commandFiles = fs.readdirSync("./commands");
const mongoose = require("mongoose");

// Get an instance of Discord Client
const bot = new discord.Client({
  commandPrefix: process.env.PREFIX,
  owner: process.env.OWNER,
});

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
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.username}#${bot.user.discriminator} (ID:${bot.user.id})`);
  console.log(`Invite link is: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=1`);
  bot.user.setActivity("Guild Wars 2");
  console.log(`Bot's presence is set to: ${bot.user.presence.game.name}`);
  console.log(`Bot is in: ${bot.guilds.size} servers`);
  console.log("Awaiting orders...");
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

bot.login(process.env.TOKEN);
