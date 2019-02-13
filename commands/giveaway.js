const { RichEmbed } = require("discord.js");
const moment = require("moment");
// eslint-disable-next-line
const countdown = require("moment-countdown");

const Entries = require("../dbModels/entries");
const Winner = require("../dbModels/winners");
const Giveaway = require("../dbModels/currentGiveaway");

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "create/enter/list",
  async execute(message, args) {

    const dbChecks = {
      entry: await Entries.findOne({ userId: message.author.id }),
      creator: await Giveaway.findOne({ userId: message.author.id }),
      active: await Giveaway.countDocuments({}),
      info: await Giveaway.find({}),
    };

    function createGiveaway(item, duration, endTime) {
      Giveaway.create(new Giveaway ({
        userId: message.author.id,
        userName: message.author.username,
        discriminator: message.author.discriminator,
        creationTime: `${message.createdAt}`,
        item: item,
        duration: duration,
        endTime: endTime,
      }));
      console.log(`Created giveaway for ${item}, which will go on for ${duration}.`);
    }

    function createWinner(winner, item) {
      Winner.create(new Winner ({
        userId: winner[0].userId,
        userName: winner[0].userName,
        discriminator: winner[0].discriminator,
        item: item,
      }));
    }

    async function endGiveaway(item) {
      try {
        const winner = await Entries.aggregate([{ $sample: { size: 1 } }]);

        if (!winner[0]) {
          Giveaway.collection.deleteMany({});
          Entries.collection.deleteMany({});
          message.channel.send("Looks like no one entered the giveaway :(");
          throw new Error(`No one entered the giveaway of ${item}.`);
        }

        createWinner(winner, item);

        console.log(`The giveaway for ${item} ended, ${winner[0].userName}#${winner[0].discriminator} won.`);
        message.channel.send(`Congratulations <@${winner[0].userId}>, you won **${item}** from ${message.author}!`);
        Giveaway.collection.deleteMany({});
        return Entries.collection.deleteMany({});
      } catch (err) {
        console.log(err.message);
      }
    }

    function initCountdown(item, countdownDuration) {
      const t = countdownDuration - moment();
      return setTimeout(() => endGiveaway(item), t);
    }

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
            throw new Error("Error: User reply for item timed out");
          }

          const item = await collectedItem.first().content;

          await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
          const collectedDuration = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] });

          if (!collectedDuration.first().content) {
            message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
            throw new Error("Error: User reply for item timed out");
          }

          const duration = await collectedDuration.first().content;

          // If the input for duration doesn't include "m" or "h", we can't match that with anything. Do a fresh start
          if ((!duration.includes("m") && !duration.includes("h")) ||
            (duration.includes("m") && duration.includes("h"))) {
            Giveaway.collection.deleteMany({});
            Entries.collection.deleteMany({});
            message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
            throw new Error("Error: Can not parse user's reply for duration");
          }

          if (duration.includes("h", 1)) {
            /* If the collectedDuration includes "h" in it,
              parse the string into an integer and multiply it with an hour in miliseconds */
            const intDuration = parseInt(duration, 10);
            const endTime = moment().add(intDuration, "hours");
            // Create the giveaway in database
            createGiveaway(item, duration, endTime);
            // Create the timer with setTimeout and resolve it with a winner
            initCountdown(item, endTime);
            // ${"" } is used to eat the whitespace to avoid creating a new line.
            return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**!${""
            } Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!${""
            } The giveaway will end in **${intDuration} hour(s)**.`);
          } else if (duration.includes("m", 1)) {
            const intDuration = parseInt(duration, 10);
            const endTime = moment().add(intDuration, "minutes");
            createGiveaway(item, duration, endTime);
            initCountdown(item, endTime);
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

        Entries.create(new Entries ({
          userId: message.author.id,
          userName: message.author.username,
          discriminator: message.author.discriminator,
          entryTime: `${message.createdAt}`,
        }));

        console.log(`${message.author.username}#${message.author.discriminator} entered the giveaway`);
        message.reply("you have entered the giveaway, good luck!");
      }
        break;

      case "list": {
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

      case "timeleft": {
        if (!dbChecks.active) return message.reply("there is no active giveaway!");
        const countdownString = moment().countdown(dbChecks.info[0].endTime).toString();
        message.channel.send(`The giveaway will end in: **${countdownString}**`);
      }
        break;

      case "info": {
        if (!dbChecks.active) return message.reply("there is no active giveaway to show the info of.");

        const countdownString = moment().countdown(dbChecks.info[0].endTime).toString();
        const infoEmbed = new RichEmbed()
          .setTitle(`Giveaway by ${dbChecks.info[0].userName}`)
          .addField("Item", `${dbChecks.info[0].item}`, true)
          .addField("Duration", `${dbChecks.info[0].duration}`, true)
          .addField("Ends In", `${countdownString}`, true)
          .setFooter(`Enter this giveaway by sending: ${process.env.PREFIX}giveaway enter`);

        message.channel.send(infoEmbed)
          .catch(() => {
            message.reply("it looks like I don't have permissions to send an embed. Here is a boring version instead:");
            message.channel.send(`${dbChecks.info[0].userName} is giving away **${dbChecks.info[0].item}**!${""
            } The giveaway will end in **${countdownString}**.${""
            }  Use \`\`${process.env.PREFIX}giveaway enter\`\` to have a chance at grabbing it!`);
          });
      }
        break;

      case "clear":
        /* If something goes wrong and the bot is stuck without ending the giveaway,
          you can forcefully refresh the tables with this command. */
        if (message.author.id === process.env.OWNER || message.member.roles.has(process.env.LEADERS) || message.member.roles.has(process.env.OFFICERS)) {
          Giveaway.collection.deleteMany({});
          Entries.collection.deleteMany({});
          return message.reply("database tables are cleared!");
        }
        return message.reply("you don't have permission to use this command!");
    }
  },
};
