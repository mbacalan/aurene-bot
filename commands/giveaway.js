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
          message.reply("what would you like to giveaway?");

          const filter = m => m.content.startsWith(">");
          const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 });

          collector.on("collect", m => {
            console.log(`Collected ${m.content}`);
          });

          collector.on("end", collected => {
            entries["currentGiveaway"] = {
              userId: message.author.id,
              username: message.author.username,
              discriminator: message.author.discriminator,
              creatingTime: `${message.createdAt}`,
              item: collected.content,
            };
            fs.writeFile("./giveawayData.json", JSON.stringify(entries, null, "\t"));
            return message.channel.send(`@everyone, ${message.author} is giving away ${collected.content}!
            Use \`\`>giveaway enter\`\` to have a chance at grabbing it!`);
          });
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
