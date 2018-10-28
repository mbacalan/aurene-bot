const { owner, leaders, officers, prefix } = require("../bot_config.json");
const { RichEmbed } = require("discord.js");
const Sequelize = require("sequelize");
const moment = require("moment");
// eslint-disable-next-line
const countdown = require("moment-countdown");
const Op = Sequelize.Op;

// Create Sequelize instance
const giveawayDb = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
});

// Import database models
const entries = giveawayDb.import("../dbModels/entries.js");
const currentGiveaway = giveawayDb.import("../dbModels/currentGiveaway.js");
const winners = giveawayDb.import("../dbModels/winners.js");

// Sync the database
giveawayDb.sync();

// Shared info about giveaway
const gwy = {
  item: "",
  duration: "",
};

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "create/enter/list",
  async execute(message, args) {

    const dbChecks = {
      entryCheck: await entries.findOne({ where: { userId: message.author.id } }),
      creatorCheck: await currentGiveaway.findOne({ where: { userId: message.author.id } }),
      activeGiveaway: await currentGiveaway.findOne({ status: { [Op.not]: false } }),
      giveawayEndTime: await currentGiveaway.findOne({ attributes: ["endTime"] }),
      giveawayCreator: await currentGiveaway.findOne({ attributes: ["userName"] }),
    };

    function createGiveaway(item, duration, endTime) {
      currentGiveaway.sync().then(() => {
        return currentGiveaway.create({
          userId: message.author.id,
          userName: message.author.username,
          discriminator: message.author.discriminator,
          creationTime: `${message.createdAt}`,
          item: item,
          duration: duration,
          endTime: endTime,
        });
      });
      console.log(`Created giveaway for ${item}, which will go on for ${duration}.`);
    }

    function createWinner(winner, item) {
      winners.sync().then(() => {
        return winners.create({
          userId: winner.userId,
          userName: winner.userName,
          discriminator: winner.discriminator,
          creationTime: `${message.createdAt}`,
          item: item,
        });
      });
    }

    async function endGiveaway(item) {
      try {
        const winner = await entries.findOne(
          { attributes: ["userId", "userName", "discriminator"], order: giveawayDb.random() }
        );

        if (winner === null) {
          currentGiveaway.destroy({ where: {}, truncate: true });
          entries.destroy({ where: {}, truncate: true });
          message.channel.send("Looks like no one entered the giveaway :(");
          throw new Error(`No one entered the giveaway of ${item}.`);
        }

        createWinner(winner, item);

        console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
        message.channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${message.author}!`);
        currentGiveaway.destroy({ where: {}, truncate: true });
        return entries.destroy({ where: {}, truncate: true });
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
        if (dbChecks.activeGiveaway) return message.reply("please wait for current giveaway to end.");

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

          gwy.item = await collectedItem.first().content;

          await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
          const collectedDuration = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] });

          if (!collectedDuration.first().content) {
            message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
            throw new Error("Error: User reply for item timed out");
          }

          gwy.duration = await collectedDuration.first().content;

          // If the input for duration doesn't include "m" or "h", we can't match that with anything. Do a fresh start
          if ((!gwy.duration.includes("m") && !gwy.duration.includes("h")) ||
            (gwy.duration.includes("m") && gwy.duration.includes("h"))) {
            currentGiveaway.destroy({ where: {}, truncate: true });
            entries.destroy({ where: {}, truncate: true });
            message.reply("I don't understand your reply. Please start over and try something like: ``5min`` or ``2h``");
            throw new Error("Error: Can not parse user's reply for duration");
          }

          if (gwy.duration.includes("h", 1)) {
            /* If the collectedDuration includes "h" in it,
              parse the string into an integer and multiply it with an hour in miliseconds */
            const intDuration = parseInt(gwy.duration, 10);
            const endTime = moment().add(intDuration, "hours");
            // Create the giveaway in database
            createGiveaway(gwy.item, gwy.duration, endTime);
            // Create the timer with setTimeout and resolve it with a winner
            initCountdown(gwy.item, endTime);
            // ${"" } is used to eat the whitespace to avoid creating a new line.
            return message.channel.send(`Hey @everyone, ${message.author} is giving away **${gwy.item}**!${""
            } Use \`\`${prefix}giveaway enter\`\` to have a chance at grabbing it!${""
            } The giveaway will end in **${intDuration} hour(s)**.`);
          } else if (gwy.duration.includes("m", 1)) {
            const intDuration = parseInt(gwy.duration, 10);
            const endTime = moment().add(intDuration, "minutes");
            createGiveaway(gwy.item, gwy.duration, endTime);
            initCountdown(gwy.item, endTime);
            return message.channel.send(`Hey @everyone, ${message.author} is giving away **${gwy.item}**!${""
            } Use \`\`${prefix}giveaway enter\`\` to have a chance at grabbing it!${""
            } The giveaway will end in **${intDuration} minute(s)**.`);
          }
        } catch (err) {
          console.log(err);
        }
      }
        break;

      case "enter": {
        if (!dbChecks.activeGiveaway) return message.reply("there is no active giveaway to enter.");
        if (dbChecks.creatorCheck) return message.reply("you can't enter your own giveaway!");
        if (dbChecks.entryCheck) return message.reply("you *already* entered this giveaway!");

        entries.sync().then(() => {
          return entries.create({
            userId: message.author.id,
            userName: message.author.username,
            discriminator: message.author.discriminator,
            entryTime: `${message.createdAt}`,
          });
        });

        console.log(`${message.author.username}#${message.author.discriminator} entered the giveaway`);
        message.reply("you have entered the giveaway, good luck!");
      }
        break;

      case "list": {
        if (!dbChecks.activeGiveaway) return message.reply("there is no active giveaway to list the entries of.");

        const entryList = [];
        let entryCount;
        await entries.findAll({ attributes: ["userName"] })
          .then((entrants) => {
            entrants.forEach((entrant) => entryList.push(entrant.userName));
          });
        await entries.findAndCountAll({ attributes: ["userName"] })
          .then((response) => entryCount = response.count);

        if (!entryCount) return message.channel.send("There are no entries yet.");
        message.channel.send(`There are currently ${entryCount} entries. They are: ${entryList.join(", ")}`);
      }
        break;

      case "timeleft": {
        if (!dbChecks.activeGiveaway) return message.reply("there is no active giveaway!");
        const countdownString = moment().countdown(dbChecks.giveawayEndTime.endTime).toString();
        message.channel.send(`The giveaway will end in: **${countdownString}**`);
      }
        break;

      case "info": {
        if (!dbChecks.activeGiveaway) return message.reply("there is no active giveaway to show the info of.");

        const countdownString = moment().countdown(dbChecks.giveawayEndTime.endTime).toString();
        const infoEmbed = new RichEmbed()
          .setTitle(`Giveaway by ${dbChecks.giveawayCreator.userName}`)
          .addField("Item", `${gwy.item}`, true)
          .addField("Duration", `${gwy.duration}`, true)
          .addField("Ends In", `${countdownString}`, true)
          .setFooter(`Enter this giveaway by sending: ${prefix}giveaway enter`);

        message.channel.send(infoEmbed)
          .catch(() => {
            message.reply("it looks like I don't have permissions to send an embed. Here is a boring version instead:");
            message.channel.send(`${dbChecks.giveawayCreator.userName} is giving away **${gwy.item}**!${""
            } The giveaway will end in **${countdownString}**.${""
            }  Use \`\`${prefix}giveaway enter\`\` to have a chance at grabbing it!`);
          });
      }
        break;

      case "clear":
        /* If something goes wrong and the bot is stuck without ending the giveaway,
          you can forcefully refresh the tables with this command. */
        if (message.author.id === owner || message.member.roles.has(leaders) || message.member.roles.has(officers)) {
          currentGiveaway.sync({ force: true });
          entries.sync({ force: true });
          return message.reply("database tables are cleared!");
        }
        return message.reply("you don't have permission to use this command!");
    }
  },
};
