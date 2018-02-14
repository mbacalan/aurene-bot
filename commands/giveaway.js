const { owner, leaders, officers } = require("../bot_config.json");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const giveawayDb = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "./giveawayData.sqlite",
});

const entries = giveawayDb.import("../dbModels/entries.js");
const currentGiveaway = giveawayDb.import("../dbModels/currentGiveaway.js");
const winners = giveawayDb.import("../dbModels/winners.js");

giveawayDb.sync();

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "enter OR create",
  async execute(message, args) {
    const entryCheck = await entries.findOne({ where: { userId: message.author.id } });
    const giveawayCreator = await currentGiveaway.findOne({ where: { userId: message.author.id } });
    const activeGiveaway = await currentGiveaway.findOne({ status: { [Op.not]: false } });
    try {
      if (args[0] === "create" && !activeGiveaway) {
        if (!activeGiveaway) {
          message.channel.send("What would you like to giveaway? Please reply in 15 seconds.");
          const filter = m => m.author.id === message.author.id;

          const itemCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });
          itemCollector.on("end", collectedItem => {
            if (!collectedItem.first()) {
              return message.reply("you had to reply in 15 seconds, I don't have all day!");
            }

            const item = collectedItem.first().content;
            message.channel.send("Got it. How long will the giveaway run for? Example: ``5min`` or ``2h``");

            const durationCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });
            durationCollector.on("end", collectedDuration => {
              if (!collectedDuration.first()) {
                return message.reply("you had to reply in 15 seconds, I don't have all day!");
              }

              const duration = collectedDuration.first().content;
              if (duration.includes("h")) {
                const parsedDuration = parseInt(duration, 10) * 3600000;

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

                console.log(`Created ${parsedDuration}(${duration}) timer for giveaway of ${item}`);
                setTimeout(async () => {
                  const winner = await entries.findOne({ attributes: ["userId", "userName", "discriminator"], order: giveawayDb.random() });
                  if (winner === null) {
                    currentGiveaway.destroy({ where: {}, truncate: true });
                    entries.destroy({ where: {}, truncate: true });
                    message.channel.send("Looks like no one entered the giveaway :(");
                    return console.log(`The giveaway for ${item} ended.`);
                  }
                  winners.sync().then(() => {
                    return winners.create({
                      userId: winner.userId,
                      userName: winner.userName,
                      discriminator: winner.discriminator,
                      creationTime: `${message.createdAt}`,
                      item: item,
                    });
                  });
                  message.channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${message.author}!`);
                  console.log(`The giveaway for ${item} ended.`);
                  currentGiveaway.destroy({ where: {}, truncate: true });
                  return entries.destroy({ where: {}, truncate: true });
                }, parsedDuration);
              } else if (duration.includes("m")) {
                const parsedDuration = parseInt(duration, 10) * 60000;

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

                console.log(`Created ${parsedDuration}(${duration}) timer for giveaway of ${item}`);
                setTimeout(async () => {
                  const winner = await entries.findOne({ attributes: ["userId", "userName", "discriminator"], order: giveawayDb.random() });
                  if (winner === null) {
                    currentGiveaway.destroy({ where: {}, truncate: true });
                    entries.destroy({ where: {}, truncate: true });
                    return message.channel.send("Looks like no one entered the giveaway :(");
                  }
                  winners.sync().then(() => {
                    return winners.create({
                      userId: winner.userId,
                      userName: winner.userName,
                      discriminator: winner.discriminator,
                      creationTime: `${message.createdAt}`,
                      item: item,
                    });
                  });
                  message.channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${message.author}!`);
                  console.log(`The giveaway for ${item} ended.`);
                  currentGiveaway.destroy({ where: {}, truncate: true });
                  return entries.destroy({ where: {}, truncate: true });
                }, parsedDuration);
              } else if (!duration.includes("m") || !duration.includes("h")) {
                currentGiveaway.destroy({ where: {}, truncate: true });
                entries.destroy({ where: {}, truncate: true });
                return message.reply("I don't recognize that format. Try something like: ``5min`` or ``2h``");
              }
              return message.channel.send(`Hey @everyone, ${message.author} is giving away **${item}**! Use \`\`>giveaway enter\`\` to have a chance at grabbing it! The giveaway will end in **${duration}**.`);
            }); // durationCollector
          }); // itemCollector
        } else if (activeGiveaway) {
          return message.reply("please wait for the ongoing giveaway to end.");
        }
      } else if (args[0] === "enter" && activeGiveaway) {
        if (!entryCheck && !giveawayCreator) {
          entries.sync().then(() => {
            return entries.create({
              userId: message.author.id,
              userName: message.author.username,
              discriminator: message.author.discriminator,
              entryTime: `${message.createdAt}`,
            });
          });
          return message.reply(`you entered the giveaway as ${message.author.username}#${message.author.discriminator}!`);
        } else if (entryCheck) {
          return message.reply("you already entered this giveaway!");
        } else if (giveawayCreator) {
          return message.reply("you can't enter your own giveaway!");
        }
      } else if (!activeGiveaway) {
        return message.reply("there is no active giveaway to enter!");
      } else if (args[0] === "clear") {
        if (message.author.id === owner || message.member.roles.has(leaders) || message.member.roles.has(officers)) {
          currentGiveaway.sync({ force: true });
          entries.sync({ force: true });
          return message.reply("database tables are cleared!");
        } return message.reply("this command is for owner only!");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
