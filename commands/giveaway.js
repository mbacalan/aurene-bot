const fs = require("fs");
const entries = JSON.parse(fs.readFileSync("./giveawayEntries.json", "utf8"));

module.exports = {
  name: "giveaway",
  aliases: ["giffaway", "lottery", "fortunetest"],
  description: "Create, enter and view giveaways",
  args: true,
  usage: "enter OR create",
  execute(message, args) {
    try {
      const userId = entries[message.author.id];
      // let activeGiveaway = currentGiveaway[guild.members];
      if (args[0] === "enter") {
        if (!userId) {
          entries[message.author.id] = {
            username: message.author.username,
            discriminator: message.author.discriminator,
            entryTime: `${message.createdAt}`,
          };
          fs.writeFile("./giveawayEntries.json", JSON.stringify(entries, null, "\t"));
          return message.reply(`You have entered the giveaway as ${message.author.username}#${message.author.discriminator}!`);
        }
        return message.reply("You've already entered this giveaway!");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
