import { TextChannel, MessageReaction, MessageEmbed } from "discord.js";
import { StaticCommand } from "../../types";
import { logger } from "../../utils/";

class Starboard implements StaticCommand {
  name = "starboard";

  async handleReaction(reaction: MessageReaction, remove = false) {
    const starChannel = reaction.client.channels.cache.get(process.env.STARBOARD_CHANNEL) as TextChannel;
    const message = reaction.message;

    if (message.partial) {
      try {
        await message.fetch();
      } catch (error) {
        logger.error("Something went wrong when fetching the message: ", error);
        return;
      }
    }

    const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => {
      if (m.embeds[0] && m.embeds[0].footer) {
        return m.embeds[0].footer.text.startsWith("⭐") && m.embeds[0].footer.text.endsWith(message.id);
      }
    });

    // Send a new embed if the message not on the starboard
    if (!stars) {
      const starReactions = message.reactions.cache.get("⭐");
      const starThreshold = process.env.NODE_ENV === "production" ? 2 : 0;

      if (!starReactions || (starReactions?.count < starThreshold)) {
        return;
      }

      const embed = new MessageEmbed()
        .addField("Author", message.author.username, true)
        .addField("Channel", `<#${message.channel.id}>`, true)
        .addField("Message", message.cleanContent)
        .addField("Go To", `[Message](${message.url})`)
        .setTimestamp(new Date())
        .setFooter({ text: `⭐ ${starReactions.count} | ${message.id}`});

      await starChannel.send({ embeds: [embed] });
    }

    // Edit the embed if the message is already on the starboard
    if (stars) {
      const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const starEmbed = await starChannel.messages.fetch(stars.id);
      const foundStarEmbed = stars.embeds[0];
      const foundStarMessage = foundStarEmbed.fields.find(field => field.name === "Message");
      const embed = new MessageEmbed()
        .addField("Author", message.author.username, true)
        .addField("Channel", `<#${message.channel.id}>`, true)
        .addField("Message", foundStarMessage.value)
        .addField("Go To", `[Message](${message.url})`)
        .setTimestamp();

      if (remove) {
        // Reduce the amount of stars if the message is already on starboard, remove if no stars left
        if (parseInt(star[1]) - 1 == 0) {
          return starEmbed.delete();
        }

        embed.setFooter({ text: `⭐ ${parseInt(star[1]) - 1} | ${message.id}`});
        await starEmbed.edit({ embeds: [embed] });
        return;
      }

      embed.setFooter({ text: `⭐ ${parseInt(star[1]) + 1} | ${message.id}`});

      await starEmbed.edit({ embeds: [embed] });
    }
  }
}

export = new Starboard();
