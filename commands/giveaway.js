const Sequelize = require("sequelize");

const sequelize = new Sequelize("giveawayData", "admin", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./giveawayData.sqlite",
});

const Entries = sequelize.define("entry", {
  userId: Sequelize.INTEGER,
  username: Sequelize.STRING,
  discriminator: Sequelize.INTEGER,
  entryTime: Sequelize.INTEGER,
});

const currentGiveaway = sequelize.define("giveaway", {
  userId: Sequelize.INTEGER,
  username: Sequelize.STRING,
  discriminator: Sequelize.INTEGER,
  creatingTime: Sequelize.INTEGER,
  item: Sequelize.STRING,
  duration: Sequelize.STRING,
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
      const activeGiveaway = await currentGiveaway.findOne({ where: { userId: message.author.id } });
      if (args[0] === "create") {
        if (!activeGiveaway) {
          message.channel.send("What would you like to giveaway?");
          const filter = m => m.author.id === message.author.id;
          const itemCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

          itemCollector.on("end", collectedItem => {
            message.channel.send("And how long will the giveaway run for?");
            const durationCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

            durationCollector.on("end", collectedDuration => {
              currentGiveaway.sync().then(() => {
                return currentGiveaway.create({
                  userId: message.author.id,
                  username: message.author.username,
                  discriminator: message.author.discriminator,
                  creatingTime: `${message.createdAt}`,
                  item: collectedItem.first().content,
                  duration: collectedDuration.first().content,
                });
              });

              // if (collectedDuration.includes("hour")) {
              //   const parsedDuration = parseInt(collectedDuration) * 3600;
              //   setTimeout(() => {
              //     const winner = entries[Math.floor(Math.random() * entries.length)];
              //     return message.channel.send(`<@${winner}>, you won ${collectedItem.first().content} from ${message.author.id}`);
              //   }, parsedDuration);
              // } else if (collectedDuration.includes("min")) {
              //   const parsedDuration = parseInt(collectedDuration) * 60;
              //   setTimeout(() => {
              //     const winner = entries[Math.floor(Math.random() * entries.length)];
              //     return message.channel.send(`<@${winner}>, you won ${collectedItem.first().content} from <@${message.author.id}>`);
              //   }, parsedDuration);
              // }

              return message.channel.send(`@everyone, ${message.author} is giving away ${collectedItem.first().content}! Use \`\`>giveaway enter\`\` to have a chance at grabbing it! The giveaway will end in ${collectedDuration.first().content}`);
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
