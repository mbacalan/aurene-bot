const { RichEmbed } = require("discord.js");
const { endGiveaway, initGiveawayTimeout } = require("../utils/general");
const { clearGiveawayAndEntries, createGiveaway, createEntry } = require("../utils/db");
const { Entries, Giveaways } = require("../dbModels");
const logger = require("../utils/logger");
const moment = require("moment");
require("moment-countdown");

class Giveaway {
  constructor() {
    this.name = "giveaway";
    this.description = "Create, enter and view giveaways";
    this.args = true;
    this.usage = "create/enter/entries/info";
    this.timeout = null;
    this.giveawayChannel = null;
    this.dbChecks = {};
  }

  async init(message) {
    this.giveawayChannel = message.client.channels.get(process.env.GIVEAWAY_CHANNEL);
    await this.setDbChecks(message);
  }

  async setDbChecks(message) {
    this.dbChecks = {
      entry: await Entries.findOne({ userId: message.author.id }),
      creator: await Giveaways.findOne({ userId: message.author.id }),
      active: await Giveaways.countDocuments({}),
      info: await Giveaways.find({}),
    };
  }

  async execute(message, args) {
    await this.init(message);

    switch (args[0]) {
      case "create": {
        await this.create(message);
      }
        break;

      case "enter": {
        await this.enter(message);
      }
        break;

      case "info": {
        await this.info(message);
      }
        break;

      case "end": {
        await this.end(message);
      }
        break;

      case "clear": {
        await this.clear(message);
      }
        break;

      default: await message.reply("invalid argument.");
    }
  }

  async create(message) {
    if (this.dbChecks.active) return message.reply("please wait for current giveaway to end.");

    try {
      // Create a filter to listen to author's input only
      const filter = m => m.author.id === message.author.id;
      await message.channel.send("What would you like to giveaway? Please reply in 15 seconds.");
      // Create the collector to learn the giveaway item
      const collectedItem = await message.channel.awaitMessages(filter, {
        maxMatches: 1,
        time: 15000,
      });

      if (!collectedItem.first()) {
        return message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
      }

      const item = collectedItem.first().content;

      await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
      const collectedDuration = await message.channel.awaitMessages(filter, {
        maxMatches: 1,
        time: 15000,
      });

      if (!collectedDuration.first()) {
        return message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
      }

      const duration = collectedDuration.first().content;

      if (Number.isNaN(parseInt(duration, 10))) {
        await message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
      }

      if (
        (!duration.includes("m") && !duration.includes("h")) || (duration.includes("m") && duration.includes("h"))
      ) {
        await message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
        await clearGiveawayAndEntries();
      }

      /* If the collectedDuration includes "h" in it,
        parse the string into an integer and multiply it with an hour in milliseconds */
      const durationType = duration.includes("m", 1) ? "minutes" : "hours";
      const intDuration = parseInt(duration, 10);
      const endTime = moment().add(intDuration, durationType);

      await createGiveaway(message, item, duration, endTime);

      this.timeout = await initGiveawayTimeout(message.author.id, this.giveawayChannel, item);

      return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**! ` +
        `Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it! ` +
        `The giveaway will end in **${intDuration} ${durationType}**.`);
    } catch (error) {
      logger.error("Error in giveaway command, create argument", error);
    }
  }

  async enter(message) {
    if (!this.dbChecks.active) return message.reply("there is no active giveaway to enter.");
    if (this.dbChecks.creator) return message.reply("you can't enter your own giveaway!");
    if (this.dbChecks.entry) return message.reply("you *already* entered this giveaway!");

    await createEntry(message);
    await message.react("✅");
  }

  async info(message) {
    if (!this.dbChecks.active) return message.reply("there is no active giveaway to show the info of.");

    const { endTime, userName, item, duration } = this.dbChecks.info[0];
    const countdownString = moment().countdown(endTime).toString();
    const entries = await Entries.find({});
    const entryList = entries.map((entrant) => entrant.userName);
    const infoEmbed = new RichEmbed()
      .setTitle(`Giveaway by ${userName}`)
      .addField("Item", `${item}`, true)
      .addField("Duration", `${duration}`, true)
      .addField("Ends In", `${countdownString}`, true)
      .addField("Entries", `${entryList.length ? entryList : "None, yet"}`)
      .setFooter(`Enter this giveaway by sending: ${process.env.PREFIX}giveaway enter`);

    message.channel.send(infoEmbed)
      .catch(() => {
        message.channel.send(`${userName} is giving away **${item}**! ` +
          `The giveaway will end in **${countdownString}**. ` +
          `Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!`);
      });
  }

  async end(message) {
    if (!this.dbChecks.active) return message.reply("there is no active giveaway to end.");
    if (message.author.id !== process.env.OWNER || message.author.id !== this.dbChecks.info[0].userId) {
      return message.reply("only the giveaway creator can end it!");
    }

    const item = this.dbChecks.info[0].item;

    try {
      await endGiveaway(this.dbChecks.creator, this.giveawayChannel, item);
      clearTimeout(this.timeout);
      this.timeout = null;
    } catch (error) {
      logger.error("Error in giveaway command, end argument", error);
      // TODO: Standardize error handling
      await message.reply("there is no giveaway to end!");
    }
  }

  async clear(message) {
    if (message.author.id === process.env.OWNER || message.member.roles.has(process.env.LEADERS) || message.member.roles.has(process.env.OFFICERS)) {
      await clearGiveawayAndEntries();
      return message.reply("database tables are cleared!");
    }

    await message.reply("you don't have permission to use this command!");
  }
}

module.exports = new Giveaway;
