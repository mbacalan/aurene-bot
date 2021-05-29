const { Guild } = require("../models");
const { redisClient } = require("../utils/api");
const logger = require("../utils/logger");

class Prefix {
  constructor() {
    this.name = "prefix";
    this.description = "Change bot's prefix";
  }

  async execute({ message, args, isOwner, isRanking }) {
    if (!args.length) {
      redisClient.get("prefix", (err, val) => {
        if (err) {
          return logger.error("Error reading from Redis: ", err);
        }

        message.reply(`current prefix is: "${val}"`);
      });

      return;
    }

    if (args.length > 1 && (isOwner || isRanking)) {
      return message.reply("prefix can only be 1 character.");
    }

    const guild = await Guild.findOne({ _id: message.guild.id });

    guild.config.prefix = args[0];

    guild.save();
    redisClient.set("prefix", process.env.PREFIX);
    message.react("✅");
  }
}

module.exports = new Prefix;
