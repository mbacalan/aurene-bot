const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const sequelize = new Sequelize("giveawayData", "admin", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./giveawayData.sqlite",
});

const Entries = sequelize.define("entry", {
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  discriminator: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entryTime: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const currentGiveaway = sequelize.define("giveaway", {
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  discriminator: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  creationTime: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  item: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  duration: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Entries.sync({ force: true });
currentGiveaway.sync({ force: true });

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "enter OR create",
  async execute(message, args) {
    try {
      const entryCheck = await Entries.findOne({ where: { userId: message.author.id } });
      const activeGiveaway = await currentGiveaway.findOne({ status: { [Op.not]: false } });
      if (args[0] === "create") {
        if (!activeGiveaway) {
          message.channel.send("What would you like to giveaway?");
          const filter = m => m.author.id === message.author.id;
          const itemCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

          itemCollector.on("end", collectedItem => {
            const item = collectedItem.first().content;
            message.channel.send("And how long will the giveaway run for?");
            const durationCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

            durationCollector.on("end", collectedDuration => {
              const duration = collectedDuration.first().content;
              currentGiveaway.sync().then(() => {
                return currentGiveaway.create({
                  userId: message.author.id,
                  username: message.author.username,
                  discriminator: message.author.discriminator,
                  creationTime: `${message.createdAt}`,
                  item: item,
                  duration: duration,
                });
              });

              if (duration.includes("hour")) {
                const parsedDuration = parseInt(duration, 10) * 3600000;
                setTimeout(async () => {
                  const winner = await Entries.findOne({ attributes: ["userId"], order: sequelize.random() });
                  message.channel.send(`<@${winner.userId}>, you won ${item} from ${message.author}`);
                  currentGiveaway.destroy({ where: {}, truncate: true });
                  return Entries.destroy({ where: {}, truncate: true });
                }, parsedDuration);
              } else if (duration.includes("min")) {
                const parsedDuration = parseInt(duration, 10) * 60000;
                setTimeout(async () => {
                  const winner = await Entries.findOne({ attributes: ["userId"], order: sequelize.random() });
                  message.channel.send(`<@${winner.userId}>, you won ${item} from ${message.author}`);
                  currentGiveaway.destroy({ where: {}, truncate: true });
                  return Entries.destroy({ where: {}, truncate: true });
                }, parsedDuration);
              }

              return message.channel.send(`@everyone, ${message.author} is giving away ${item}! Use \`\`>giveaway enter\`\` to have a chance at grabbing it! The giveaway will end in ${duration}`);
            }); // durationCollector
          }); // itemCollector
        } else if (activeGiveaway) {
          return message.reply("please wait for the ongoing giveaway to end.");
        }
      } else if (args[0] === "enter") {
        if (activeGiveaway) {
          if (!entryCheck) {
            Entries.sync().then(() => {
              return Entries.create({
                userId: message.author.id,
                userName: message.author.username,
                discriminator: message.author.discriminator,
                entryTime: `${message.createdAt}`,
              });
            });
            return message.reply(`You have entered the giveaway as ${message.author.username}#${message.author.discriminator}!`);
          } else if (entryCheck) {
            return message.reply("You've already entered this giveaway!");
          }
        } else if (!activeGiveaway) {
          return message.reply("there is no active giveaway to enter!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
