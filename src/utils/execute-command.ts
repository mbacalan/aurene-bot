import { Client, Message } from "discord.js";
import { Guilds } from "../models";
import { Command } from "../types";
import { logger, redisClient } from ".";

class CommandHandler {
  static instance: CommandHandler;

  constructor() {
    if (!CommandHandler.instance) {
      CommandHandler.instance = this;
    }

    return CommandHandler.instance;
  }

  async getPrefix(message: Message) {
    let prefix: string;

    redisClient.get("prefix", function(err, val: string) {
      if (err) {
        return logger.error("Error reading from Redis: ", err);
      }

      prefix = val;
    });

    if (!prefix) {
      const guild = await Guilds.findOne({ _id: message.guild.id });

      if (!guild.config) {
        guild.config = {
          prefix: process.env.PREFIX,
        };

        redisClient.set("prefix", process.env.PREFIX);
        return process.env.PREFIX;
      }

      redisClient.set("prefix", guild.config.prefix, "ex", 600);
      return guild.config.prefix;
    }
  }

  async execute(bot: Client, message: Message) {
    // Ignore messages from bots and DMs
    if (message.author.bot || !message.guild) {
      return false;
    }

    const prefix = await this.getPrefix(message);

    // Prefix is either what's defined or the tag of the bot
    const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|\\${prefix})\\s*`);

    if (!prefixRegex.test(message.content)) {
      return false;
    }

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check commands by name and alias
    const command: Command = bot.commands.get(commandName) || bot.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

    if (!command) {
      return false;
    }

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments!`;

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
      }

      return message.reply(reply);
    }

    try {
      const isOwner = message.author.id == process.env.OWNER;
      const isRanking = message.member.roles.cache.some(role => [process.env.LEADERS, process.env.OFFICERS].includes(role.id));

      await message.channel.sendTyping();
      await command.execute({ message, args, isOwner, isRanking });
    } catch (error) {
      logger.error(`Error while executing ${command.name} command `, error);
      await message.react("❌");
    }
  }
}

export const commandHandler = new CommandHandler();
