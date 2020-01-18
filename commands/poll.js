const { RichEmbed } = require("discord.js");
const { pollEmojis, pollEmojiUnicodes } = require("../utils/emojiData");

class Poll {
  constructor() {
    this.name = "poll";
    this.description = "Make a poll with given arguments";
    this.usage = "{question} [option1] [option2] (max 25)";
  }

  execute(message) {
    try {
      // Get the text inside curly brackets
      const question = message.content.match(/{([^}]+)}/);
      // Get the text inside square brackets
      const options = message.content.match(/[^[\]]+(?=])/g);

      if (!question) return message.reply("you didn't provide a question. To do so, put your question inside curly brackets.");
      if (!options) return message.reply("you didn't provide any options. To do so, put each option inside square brackets");

      const pollEmbed = new RichEmbed().setTitle(question[1]);
      const pollOptions = [];
      for (let i = 0; i < options.length; i++) {
        pollOptions.push(`${pollEmojis[i]} ${options[i]}`);
      }

      pollOptions.forEach((answer) => pollEmbed.addField("\u200b", answer));

      message.channel.send(pollEmbed).then(async function reactToEmbed(m) {
        for (let i = 0; i < options.length; i++) {
          await m.react(pollEmojiUnicodes[i]);
        }
      });

      message.delete();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new Poll;
