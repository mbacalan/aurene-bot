const logger = require("./logger");
const { redisClient } = require("./api");
const { Guild } = require("../models");

class CommandHandler {
  constructor() {
    if (!CommandHandler.instance) {
      CommandHandler.instance = this;
    }

    return CommandHandler.instance;
  }

  async getPrefix(message) {
    let prefix;

    redisClient.get("prefix", function(err, val) {
      if (err) {
        return logger.error("Error reading from Redis: ", err);
      }

      prefix = val;
    });

    if (!prefix) {
      const guild = await Guild.findOne({ _id: message.guild.id });

      if (!guild.config) {
        await guild.config.push({
          prefix: process.env.PREFIX,
        });

        return process.env.PREFIX;
      }

      return guild.config.prefix;
    }
  }

  async execute(bot, message) {
    // Ignore messages from bots
    if (message.author.bot) {
      return false;
    }

    const prefix = await this.getPrefix(message);

    // Prefix is either what's defined or the tag of the bot
    const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|\\${await prefix})\\s*`);

    if (!prefixRegex.test(message.content)) {
      return false;
    }

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check commands by name and alias
    const command = bot.commands.get(commandName) || bot.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

    if (!command) {
      return false;
    }

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
    }

    try {
      const isOwner = message.author.id == process.env.OWNER;
      const isRanking = message.member.roles.cache.some(role => [process.env.LEADERS, process.env.OFFICERS].includes(role.id));

      message.channel.startTyping();
      await command.execute({ message, args, isOwner, isRanking });
      message.channel.stopTyping(true);
    } catch (error) {
      logger.error(`Error while executing ${command.name} command `, error);
      await message.react("❌");
    }
  }
}

module.exports = new CommandHandler();
