const fs = require("fs");
const entries = JSON.parse(fs.readFileSync("./giveawayData.json", "utf8"));

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "enter OR create",
  execute(message, args) {
    try {
      const entryCheck = entries[message.author.id];
      const activeGiveaway = entries["currentGiveaway"];
      if (args[0] === "create") {
        if (!activeGiveaway) {
          message.channel.send("What would you like to giveaway?");
          const filter = m => m.author.id === message.author.id;
          const itemCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

          itemCollector.on("end", collectedItem => {
            message.channel.send("And how long will the giveaway run for?");
            const durationCollector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

            durationCollector.on("end", collectedDuration => {
              entries["currentGiveaway"] = {
                userId: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator,
                creatingTime: `${message.createdAt}`,
                item: collectedItem.first().content,
                duration: collectedDuration.first().content,
              };
              fs.writeFile("./giveawayData.json", JSON.stringify(entries, null, "\t"));
              return message.channel.send(`@everyone, ${message.author} is giving away ${collectedItem.first().content}! Use \`\`>giveaway enter\`\` to have a chance at grabbing it! The giveaway will end in ${collectedDuration.first().content}`);
            }); // durationCollector
          }); // itemCollector
          const giver = Object.entries(entries)[0];
          const item = Object.entries(entries)[4];
          const duration = Object.entries(entries)[5];
          if (duration.includes("hour")) {
            const parsedDuration = parseInt(duration) * 3600;
            setTimeout(() => {
              const winner = entries[Math.floor(Math.random() * entries.length)];
              return message.channel.send(`<@${winner}>, you won ${item} from ${giver}`);
            }, parsedDuration);
          } else if (duration.includes("min")) {
            const parsedDuration = parseInt(duration) * 60;
            setTimeout(() => {
              const winner = entries[Math.floor(Math.random() * entries.length)];
              return message.channel.send(`<@${winner}>, you won ${item} from <@${giver}>`);
            }, parsedDuration);
          }
        } else if (activeGiveaway) {
          return message.reply("please wait for the ongoing giveaway to end.");
        }
      } else if (args[0] === "enter") {
        if (activeGiveaway) {
          if (!entryCheck) {
            entries[message.author.id] = {
              username: message.author.username,
              discriminator: message.author.discriminator,
              entryTime: `${message.createdAt}`,
            };
            fs.writeFile("./giveawayData.json", JSON.stringify(entries, null, "\t"));
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
