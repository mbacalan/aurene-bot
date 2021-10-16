import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Guilds } from "../models";
import { Command, CommandParams, IGiveaway } from "../types";
import { logger, endGiveaway, createGiveawayEntryCollector } from "../utils";

class Giveaway implements Command {
  name = "giveaway";
  description = "Create a giveaway";
  args = true;
  usage = "create";
  giveawayChannel: TextChannel;

  async execute({ message, args }: CommandParams) {
    // TODO: Add error handling for if GIVEAWAY_CHANNEL is unset, get GIVEAWAY_CHANNEL from guild config
    this.giveawayChannel = message.client.channels.cache.get(process.env.GIVEAWAY_CHANNEL) as TextChannel;

    switch (args[0]) {
      case "create": {
        // TODO: Pass args here to create giveaways with single command
        await this.create(message);
      }
        break;

      default: await message.reply("Invalid argument.");

      // TODO: Since we support multiple giveaways at once, the info command needs a rework
      // to display information about any given active giveaway without cluttering the channel.
    }
  }

  async create(message: Message) {
    if (message.channel.id != this.giveawayChannel.id) {
      message.reply(`You can only create giveaways in ${this.giveawayChannel} channel.`);
      return false;
    }

    const filter = (m: { author: { id: string; }; }) => m.author.id === message.author.id;
    const itemQuestion = await message.reply("What would you like to giveaway? Please reply in 20 seconds.");
    const collectedItem = await message.channel.awaitMessages({
      filter,
      time: 20000,
      max: 1
    });

    if (!collectedItem.first()) {
      return message.reply("you had to reply in 20 seconds, please start over and try to reply in time.");
    }

    const item = collectedItem.first().content;
    const durationQuestion = await message.reply("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
    const collectedDuration = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 20000,
    });

    if (!collectedDuration.first()) {
      return message.reply("you had to reply in 20 seconds, please start over and try to reply in time.");
    }

    const duration = collectedDuration.first().content;

    if (
      Number.isNaN(parseInt(duration, 10)) ||
      (!duration.includes("m") && !duration.includes("h")) ||
      (duration.includes("m") && duration.includes("h"))
    ) {
      await message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
      return;
    }

    /* If the collectedDuration includes "h" in it,
      parse the string into an integer and multiply it with an hour in milliseconds */
    const durationType = duration.includes("m", 1) ? "minute" : "hour";
    const intDuration = parseInt(duration, 10);
    const role = process.env.GIVEAWAY_ROLE ? `<@&${process.env.GIVEAWAY_ROLE}>` : "@everyone";
    let endTime = new Date();

    if (durationType == "minute") {
      endTime.setMinutes(endTime.getMinutes() + intDuration);
    } else if (durationType == "hour") {
      endTime.setHours(endTime.getHours() + intDuration);
    }

    const infoEmbed = new MessageEmbed()
      .setTitle(item)
      .addField("Hosted By", message.author.tag, true)
      .addField("Duration", duration, true)
      .setFooter("Enter this giveaway by reacting with checkmark below.");

    const giveawayMessage = await message.channel.send({ content: role, embeds: [infoEmbed] })
      .catch(() => {
        return message.channel.send(`Hey ${role}, ${message.author} is giving away **${item}**! ` +
          "Use the reaction below to enter. " +
          `This giveaway will end in **${intDuration} ${durationType}**.`);
      });

    await giveawayMessage.react("✅");

    const guild = await Guilds.findOne({ _id: message.guild.id });

    try {
      guild.giveaways.push({
        _id: giveawayMessage.id,
        userId: message.author.id,
        userTag: message.author.tag,
        creationTime: message.createdAt,
        item: item,
        duration: duration,
        endTime: endTime,
      } as IGiveaway);

      await guild.save();
    } catch (error) {
      logger.error("Error creating giveaway ", error);
      return message.react("❌");
    }

    const entryCollector = createGiveawayEntryCollector(guild, this.giveawayChannel, giveawayMessage);

    setTimeout(async () => {
      await endGiveaway(giveawayMessage, this.giveawayChannel);
      entryCollector.stop();
    }, endTime.getTime() - Date.now());

    [
      message,
      itemQuestion,
      durationQuestion,
      collectedItem.first(),
      collectedDuration.first(),
    ].forEach(async (m) => {
      await m.delete();
    });
  }
}

export = new Giveaway();
