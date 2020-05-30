const { MessageEmbed } = require("discord.js");

// TODO: DRY
class Starboard {
  constructor() {
    this.name = "starboard";
  }

  async addedReaction(bot, reaction, author) {
    const starChannel = bot.channels.cache.get(process.env.STARBOARD_CHANNEL);
    const message = reaction.message;

    if (reaction.emoji.name !== "⭐" || message.author.id === author.id || message.author.bot || !starChannel) return;

    const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => {
      if (m.embeds[0] && m.embeds[0].footer) {
        return m.embeds[0].footer.text.startsWith("⭐") && m.embeds[0].footer.text.endsWith(message.id);
      }
    });

    // Edit the embed if the message is already on the starboard
    if (stars) {
      const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const starEmbed = await starChannel.messages.fetch(stars.id);
      const foundStarEmbed = stars.embeds[0];
      const foundStarMessage = foundStarEmbed.fields.find(field => field.name === "Message");

      const embed = new MessageEmbed()
        .addField("Author", message.author, true)
        .addField("Channel", message.channel, true)
        .addField("Message", foundStarMessage.value)
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1]) + 1} | ${message.id}`);

      await starEmbed.edit({ embed });
    }

    // Send a new embed if the message not on the starboard
    if (!stars) {
      const starReactions = message.reactions.cache.get("⭐");

      if (starReactions.count < 3) return;

      const embed = new MessageEmbed()
        .addField("Author", message.author, true)
        .addField("Channel", message.channel, true)
        .addField("Message", message.cleanContent)
        .setTimestamp(new Date())
        .setFooter(`⭐ 1 | ${message.id}`);

      await starChannel.send({ embed });
    }
  }

  async removedReaction(bot, reaction, author) {
    const starChannel = bot.channels.cache.get(process.env.STARBOARD_CHANNEL);
    const message = reaction.message;

    if (reaction.emoji.name !== "⭐" || message.author.id === author.id || message.author.bot || !starChannel) return;

    const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith("⭐") && m.embeds[0].footer.text.endsWith(message.id));

    // Reduce the amount of stars if the message is already on starboard, remove if no stars left
    if (stars) {
      const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const starEmbed = await starChannel.messages.fetch(stars.id);
      const foundStarEmbed = stars.embeds[0];
      const foundStarMessage = foundStarEmbed.fields.find(field => field.name === "Message");

      if (parseInt(star[1]) - 1 == 0) return starEmbed.delete({ timeout: 1000 });

      const embed = new MessageEmbed()
        .addField("Author", message.author, true)
        .addField("Channel", message.channel, true)
        .addField("Message", foundStarMessage.value)
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1]) - 1} | ${message.id}`);

      await starEmbed.edit({ embed });
    }
  }
}

module.exports = new Starboard;
