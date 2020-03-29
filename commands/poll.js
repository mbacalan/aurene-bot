const { MessageEmbed } = require("discord.js");
const { pollEmojis, pollEmojiUnicodes } = require("../utils/emojiData");
const logger = require("../utils/logger");

class Poll {
  constructor() {
    this.name = "poll";
    this.description = "Make a poll with given arguments";
    this.args = true;
    this.usage = "{question} [option1] [option2] (max. 25)";
  }

  async execute(message) {
    try {
      // Get the text inside curly brackets
      const question = message.content.match(/{([^}]+)}/);
      // Get the text inside square brackets
      const options = message.content.match(/[^[\]]+(?=])/g);

      if (!question) {
        return message.reply("you didn't provide a question. To do so, put your question inside curly brackets.");
      }

      if (!options) {
        return message.reply("you didn't provide any options. To do so, put each option inside square brackets");
      }

      const pollEmbed = new MessageEmbed().setTitle(question[1]);
      const pollOptions = [];

      for (let i = 0; i < options.length; i++) {
        pollOptions.push({ name: "\u200b", value: `${pollEmojis[i]} ${options[i]}` });
      }

      pollEmbed.addFields(pollOptions);

      const poll = await message.channel.send(pollEmbed).catch(() => {
        message.channel.send("I'm lacking permissions to send an embed!");
      });

      if (!poll) return;

      for (let i = 0; i < options.length; i++) {
        await poll.react(pollEmojiUnicodes[i]);
      }

      message.delete();
    } catch (error) {
      logger.error("Error in poll command", error);
    }
  }
}

module.exports = new Poll;
