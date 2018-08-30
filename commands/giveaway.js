const { owner, leaders, officers, prefix } = require("../bot_config.json");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Create Sequelize instance
const giveawayDb = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "./giveawayData.sqlite",
});

// Import database models
const entries = giveawayDb.import("../dbModels/entries.js");
const currentGiveaway = giveawayDb.import("../dbModels/currentGiveaway.js");
const winners = giveawayDb.import("../dbModels/winners.js");

// Sync the database
giveawayDb.sync();

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "enter OR create",
  async execute(message, args) {
    const entryCheck = await entries.findOne({ where: { userId: message.author.id } });
    const activeGiveaway = await currentGiveaway.findOne({ status: { [Op.not]: false } });

    function createGiveaway(item, duration) {
      currentGiveaway.sync().then(() => {
        return currentGiveaway.create({
          userId: message.author.id,
          userName: message.author.username,
          discriminator: message.author.discriminator,
          creationTime: `${message.createdAt}`,
          item: item,
          duration: duration,
        });
      });
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

    switch (args[0]) {
      case "create": {
        let item;
        let duration;

        try {
          // Create a filter to listen to author's input only
          const filter = m => m.author.id === message.author.id;
          // Send the initial message asking for user input
          await message.channel.send("What would you like to giveaway? Please reply in 15 seconds.");
          // Create the collector to learn the giveaway item
          await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] })
            .then(collected => item = collected.first().content)
            .catch(() => {
              message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
            });

          await message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");
          await message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ["time"] })
            .then(collected => duration = collected.first().content)
            .catch(() => {
              message.reply("you had to reply in 15 seconds, please start over and try to reply in time.");
            });

          if (duration.includes("h", 1)) {
            /* If the collectedDuration includes "h" in it,
              parse the string into an integer and multiply it with an hour in miliseconds */
            const parsedDuration = parseInt(duration, 10) * 3600000;

            createGiveaway(item, duration);

            console.log(`Created ${parsedDuration}(${duration}) timer for giveaway of ${item}`);
            setTimeout(async () => {
              // Look for entries with the given attributes and randomly pick one of them
              const winner = await entries.findOne({ attributes: ["userId", "userName", "discriminator"], order: giveawayDb.random() });
              if (winner === null) {
                // If winner is null, that means no one entered. Recreate the tables for a fresh start
                currentGiveaway.destroy({ where: {}, truncate: true });
                entries.destroy({ where: {}, truncate: true });
                message.channel.send("Looks like no one entered the giveaway :(");
                return console.log(`The giveaway for ${item} ended.`);
              }
              // Save the winner into the database, for fun
              createWinner(winner, item);

              message.channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${message.author}!`);
              console.log(`The giveaway for ${item} ended.`);
              currentGiveaway.destroy({ where: {}, truncate: true });
              return entries.destroy({ where: {}, truncate: true });
            }, parsedDuration);
          } else if (duration.includes("m", 1)) {
            /* If the collectedDuration includes "m" in it,
              parse the string into an integer and multiply it with a minute in miliseconds */
            const parsedDuration = parseInt(duration, 10) * 60000;

            createGiveaway(item, duration);

            console.log(`${message.author.id} is giving away ${item}`);
            console.log(`Created ${duration}(${parsedDuration}ms) timer for giveaway of ${item}`);
            setTimeout(async () => {
              const winner = await entries.findOne({ attributes: ["userId", "userName", "discriminator"], order: giveawayDb.random() });
              if (winner === null) {
                currentGiveaway.destroy({ where: {}, truncate: true });
                entries.destroy({ where: {}, truncate: true });
                return message.channel.send("Looks like no one entered the giveaway :(");
              }

              createWinner(winner, item);

              console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
              message.channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${message.author}!`);
              currentGiveaway.destroy({ where: {}, truncate: true });
              return entries.destroy({ where: {}, truncate: true });
            }, parsedDuration);
          } else if (!duration.includes("m") || !duration.includes("h")) {
            // If the input for duration doesn't include "m" or "h", we can't match that with anything. Do a fresh start
            currentGiveaway.destroy({ where: {}, truncate: true });
            entries.destroy({ where: {}, truncate: true });
            return message.reply("I don't recognize that format. Try something like: ``5min`` or ``2h``");
          }
          return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**! Use \`\`${prefix}giveaway enter\`\` to have a chance at grabbing it! The giveaway will end in **${duration}**.`);
        } catch (err) {
          console.log(err);
        }
      }
        break;

      case "enter": {
        const giveawayCreator = await currentGiveaway.findOne({ where: { userId: message.author.id } });

        if (giveawayCreator) return message.reply("you can't enter your own giveaway!");
        if (entryCheck) return message.reply("you *already* entered this giveaway!");

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
        const entryList = [];
        let entryCount;
        await entries.findAll({ attributes: ["userName"] })
          .then((entrants) => {
            entrants.forEach((entrant) => entryList.push(entrant.userName));
          });
        await entries.findAndCountAll({ attributes: ["userName"] })
          .then((response) => entryCount = response.count);
        if (!entryCount) {
          message.channel.send("There are no entries yet.");
        } else if (entryCount) {
          message.channel.send(`There are currently ${entryCount} entries. They are: ${entryList.join(", ")}`);
        }
      }
        break;
      case "clear":
        /* If something goes wrong and the bot is stuck without ending the giveaway,
                you can forcefully refresh the tables with this command. */
        if (message.author.id === owner || message.member.roles.has(leaders) || message.member.roles.has(officers)) {
          currentGiveaway.sync({ force: true });
          entries.sync({ force: true });
          return message.reply("database tables are cleared!");
        } else {
          return message.reply("you don't have permission to use this command!");
        }
    }
  },
};
