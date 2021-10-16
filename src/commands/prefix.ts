import { Guilds } from "../models";
import { Command, CommandParams } from "../types";
import { redisClient, logger } from "../utils/";

class Prefix implements Command {
  name = "prefix";
  description = "Change bot's prefix";

  async execute({ message, args, isOwner, isRanking }: CommandParams) {
    if (!args.length) {
      redisClient.get("prefix", (err, val) => {
        if (err) {
          return logger.error("Error reading from Redis: ", err);
        }

        message.reply(`Current prefix is: "${val}"`);
      });

      return;
    }

    if (args.length > 1 && (isOwner || isRanking)) {
      return message.reply("Prefix can only be 1 character long.");
    }

    const guild = await Guilds.findOne({ _id: message.guild.id });

    guild.config.prefix = args[0];

    guild.save();
    redisClient.set("prefix", args[0]);
    message.react("✅");
  }
}

export = new Prefix();
