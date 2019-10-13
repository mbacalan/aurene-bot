const { RichEmbed } = require("discord.js");
const moment = require("moment");
const helpers = require("../utils/helpers");
require("moment-countdown");

const { Entries, Giveaway } = require("../dbModels/models");

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "create/enter/entries/info",
  async execute(message, args) {
    const giveawayChannel = message.client.channels.get(process.env.GIVEAWAY_CHANNEL);
    const dbChecks = {
      entry: await Entries.findOne({ userId: message.author.id }),
      creator: await Giveaway.findOne({ userId: message.author.id }),
      active: await Giveaway.countDocuments({}),
      info: await Giveaway.find({}),
    };

    switch (args[0]) {
    case "create": {
      if (dbChecks.active) return message.reply("please wait for current giveaway to end.");

      try {
        console.log(`${message.author.username} (${message.author.id}) is creating a giveaway...`);
        // Create a filter to listen to author's input only
        const filter = m => m.author.id === message.author.id;
        // Send the initial message asking for user input
        await message.channel.send("What would you like to giveaway? Please reply in 15 seconds.");
        // Create the collector to learn the giveaway item
        const collectedItem = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] });

        if (!collectedItem.first().content) {
          message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
          throw new Error("User reply for item timed out");
        }

        const item = await collectedItem.first().content;

        await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
        const collectedDuration = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] });

        if (!collectedDuration.first().content) {
          message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
          throw new Error("User reply for duration timed out");
        }

        const duration = await collectedDuration.first().content;

        // If, when parsed, duration is NaN: we can't do anything with it
        if (Number.isNaN(parseInt(duration, 10))) {
          message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
          throw new Error("Can not parse user's reply for duration (isNaN)");
        }

        // If the input for duration doesn't include "m" or "h", we can't match that with anything. Do a fresh start
        if ((!duration.includes("m") && !duration.includes("h")) ||
            (duration.includes("m") && duration.includes("h"))) {
          helpers.clearGiveawayAndEntries(Giveaway, Entries);
          message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
          throw new Error("Can not parse user's reply for duration (includesH&M)");
        }

        if (duration.includes("h", 1)) {
          /* If the collectedDuration includes "h" in it,
            parse the string into an integer and multiply it with an hour in miliseconds */
          const intDuration = parseInt(duration, 10);
          let endTime = moment().add(intDuration, "hours");

          await helpers.createGiveaway(Giveaway, message, item, duration, endTime);

          Giveaway.findOne({}).then(function(result) {
            endTime = result.endTime;
            const timeout = endTime - moment();
            setTimeout(() => helpers.endGiveaway(dbChecks.creator, giveawayChannel, item), timeout);
          });

          // ${"" } is used to eat the whitespace to avoid creating a new line.
          return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**!${""
          } Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!${""
          } The giveaway will end in **${intDuration} hour(s)**.`);
        } else if (duration.includes("m", 1)) {
          const intDuration = parseInt(duration, 10);
          let endTime = moment().add(intDuration, "minutes");
          await helpers.createGiveaway(Giveaway, message, item, duration, endTime);
          Giveaway.findOne({}).then(function(result) {
            endTime = result.endTime;
            const timeout = endTime - moment();
            setTimeout(() => helpers.endGiveaway(dbChecks.creator, giveawayChannel, item), timeout);
          });
          return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**!${""
          } Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!${""
          } The giveaway will end in **${intDuration} minute(s)**.`);
        }
      } catch (err) {
        console.log(err);
      }
    }
      break;

    case "enter": {
      if (!dbChecks.active) return message.reply("there is no active giveaway to enter.");
      if (dbChecks.creator) return message.reply("you can't enter your own giveaway!");
      if (dbChecks.entry) return message.reply("you *already* entered this giveaway!");

      Entries.create({
        userId: message.author.id,
        userName: message.author.username,
        discriminator: message.author.discriminator,
        entryTime: `${message.createdAt}`,
      });

      console.log(`${message.author.username}#${message.author.discriminator} entered the giveaway`);
      message.reply("you have entered the giveaway, good luck!");
    }
      break;

    case "entries": {
      if (!dbChecks.active) return message.reply("there is no active giveaway to list the entries of.");

      const entryList = [];
      await Entries.find({})
        .then((entrants) => {
          entrants.forEach((entrant) => entryList.push(entrant.userName));
        });

      if (!entryList.length) return message.channel.send("There are no entries yet.");
      message.channel.send(`There are currently ${entryList.length} entries. They are: ${entryList.join(", ")}`);
    }
      break;

    case "info": {
      if (!dbChecks.active) return message.reply("there is no active giveaway to show the info of.");
      const giveawayInfo = dbChecks.info[0];
      const countdownString = moment().countdown(giveawayInfo.endTime).toString();
      const infoEmbed = new RichEmbed()
        .setTitle(`Giveaway by ${giveawayInfo.userName}`)
        .addField("Item", `${giveawayInfo.item}`, true)
        .addField("Duration", `${giveawayInfo.duration}`, true)
        .addField("Ends In", `${countdownString}`, true)
        .setFooter(`Enter this giveaway by sending: ${process.env.PREFIX}giveaway enter`);

      message.channel.send(infoEmbed)
        .catch(() => {
          message.channel.send(`${giveawayInfo.userName} is giving away **${giveawayInfo.item}**!${""
          } The giveaway will end in **${countdownString}**.${""
          }  Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!`);
        });
    }
      break;

    case "end": {
      if (message.author.id === process.env.OWNER || message.author.id === dbChecks.info[0].userId) {
        const item = dbChecks.info[0].item;
        return helpers.endGiveaway(dbChecks.creator, giveawayChannel, item);
      }
      return message.reply("only the giveaway creator can end it!");
    }

    case "clear":
      /* If something goes wrong and the bot is stuck without ending the giveaway,
          you can forcefully refresh the tables with this command. */
      if (message.author.id === process.env.OWNER ||
        message.member.roles.has(process.env.LEADERS) ||
        message.member.roles.has(process.env.OFFICERS)) {
        helpers.clearGiveawayAndEntries();
        return message.reply("database tables are cleared!");
      }
      return message.reply("you don't have permission to use this command!");
    }
  },
};
