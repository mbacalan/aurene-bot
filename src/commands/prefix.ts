import { Command, CommandParams } from "../types";
import { Guild } from "../models";
import { redisClient } from "../utils/api";
import logger from "../utils/logger";

class Prefix implements Command {
  name = "prefix";
  description = "Change bot's prefix";

  async execute({ message, args, isOwner, isRanking }: CommandParams) {
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

export = new Prefix();
