const { Command } = require("discord.js-commando");
const fs = require("fs");
const entries = JSON.parse(fs.readFileSync("./giveawayEntries.json", "utf8"));

module.exports = class giveawayCommand extends Command {
  constructor(bot) {
    super(bot, {
      name: "giveaway",
      aliases: ["giffaway", "lottery", "fortunetest"],
      group: "general",
      memberName: "giveaway",
      description: "Create, enter and view giveaways",
      examples: [">giveaway create", ">giffaway enter"],
      args: [
        {
          key: "action",
          prompt: "Would you like to enter a giveaway or create one?",
          type: "string",
          default: "enter",
        },
      ],
    });
  }

  async run(message, { action }) {
    try {
      const userId = await entries[message.author.id];
      // let activeGiveaway = currentGiveaway[guild.members];
      if (action === "enter") {
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
    }
    catch (error) {
      console.log(error);
    }
  }
};
