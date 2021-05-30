const { MessageEmbed } = require("discord.js");
const { endGiveaway, createGiveawayEntryCollector } = require("../utils");
const { Guild } = require("../models");
const moment = require("moment");
const logger = require("../utils/logger");

class Giveaway {
  constructor() {
    this.name = "giveaway";
    this.description = "Create a giveaway";
    this.args = true;
    this.usage = "Create";
    this.giveawayChannel = null;
  }

  async execute({ message, args }) {
    // TODO: Add error handling for if GIVEAWAY_CHANNEL is unset, get GIVEAWAY_CHANNEL from guild config
    this.giveawayChannel = message.client.channels.cache.get(process.env.GIVEAWAY_CHANNEL);

    switch (args[0]) {
      case "create": {
        // TODO: Pass args here to create giveaways with single command
        await this.create(message);
      }
        break;

      default: await message.reply("invalid argument.");

      // TODO: Since we support multiple giveaways at once, the info command needs a rework
      // to display information about any given active giveaway without cluttering the channel.
      // Code below is currently not in use.
    }
  }

  async create(message) {
    if (message.channel.id != this.giveawayChannel) {
      message.reply(`you can only create giveaways in ${this.giveawayChannel} channel.`);
      return false;
    }

    const filter = m => m.author.id === message.author.id;
    const itemQuestion = await message.channel.send("What would you like to giveaway? Please reply in 20 seconds.");
    const collectedItem = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 20000,
    });

    if (!collectedItem.first()) {
      return message.reply("you had to reply in 20 seconds, please start over and try to reply in time.");
    }

    const item = collectedItem.first().content;
    const durationQuestion = await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
    const collectedDuration = await message.channel.awaitMessages(filter, {
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
    }

    /* If the collectedDuration includes "h" in it,
      parse the string into an integer and multiply it with an hour in milliseconds */
    const durationType = duration.includes("m", 1) ? "minute" : "hour";
    const intDuration = parseInt(duration, 10);
    const endTime = moment().add(intDuration, durationType);
    const role = process.env.GIVEAWAY_ROLE ? `<@&${process.env.GIVEAWAY_ROLE}>` : "@everyone";

    const infoEmbed = new MessageEmbed()
      .setTitle(item)
      .addField("Hosted By", message.author.tag, true)
      .addField("Duration", duration, true)
      .setFooter("Enter this giveaway by reacting with checkmark below.");

    const giveawayMessage = await message.channel.send(role, infoEmbed)
      .catch(() => {
        message.channel.send(`Hey ${role}, ${message.author} is giving away **${item}**! ` +
          "Use the reaction below to enter. " +
          `This giveaway will end in **${intDuration} ${durationType}**.`);
      });

    await giveawayMessage.react("✅");

    const guild = await Guild.findOne({ _id: message.guild.id });

    try {
      guild.giveaways.push({
        _id: giveawayMessage.id,
        userId: message.author.id,
        userTag: message.author.tag,
        creationTime: message.createdAt,
        item: item,
        duration: duration,
        endTime: endTime,
      });

      await guild.save();
    } catch (error) {
      logger.error("Error creating giveaway ", error);
      return message.react("❌");
    }

    const entryCollector = createGiveawayEntryCollector(guild, this.giveawayChannel, giveawayMessage);

    setTimeout(async () => {
      await endGiveaway(giveawayMessage, this.giveawayChannel);
      entryCollector.stop();
    }, endTime.diff(moment(), "milliseconds"));

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

module.exports = new Giveaway;
