import { TextChannel, MessageEmbed } from "discord.js";
import emoji from "emoji-dictionary";
import { Command, CommandParams } from "../../types";
import { logger } from "../../utils/";
import { roleEmojis, roleEmojiUnicodes } from "../../data/";

// TODO: Doesn't work, unused, disable?
class Roles implements Command {
  name = "roles";
  description = "Join/leave a public role";
  roles = process.env.PUBLIC_ROLES ? process.env.PUBLIC_ROLES.split(",") : null;
  roleEmbedFields = [];
  oldEmbed = null;

  async execute({ message }: CommandParams) {
    const channel = message.client.channels.cache.get(process.env.ROLES_CHANNEL) as TextChannel;
    const fetchedMessages = await channel.messages.fetch({ limit: 50 });

    this.oldEmbed = fetchedMessages.find(msg => {
      if (msg.embeds[0] && msg.embeds[0].title) {
        return msg.embeds[0].title == "Public Roles";
      }
    });

    if (this.oldEmbed) {
      this.roles.forEach(async (role, i) => {
        const totalFieldAmount = this.oldEmbed.embeds[0].fields.length;
        const field = this.oldEmbed.embeds[0].fields[i];

        this.roleEmbedFields.push({ name: "\u200b", value: `${roleEmojis[i]} <@&${this.roles[i]}>` });

        if (!field || !field.value.includes(`<@&${role}>`) || totalFieldAmount != this.roles.length) {
          const embed = new MessageEmbed();

          embed.setTitle("Public Roles").addFields(this.roleEmbedFields);

          await this.oldEmbed.edit({ embed });
        }
      });

      if (this.oldEmbed.reactions.cache.size != this.roles.length) {
        await this.oldEmbed.reactions.removeAll();

        this.roles.forEach(async (role, i) => {
          await this.oldEmbed.react(roleEmojiUnicodes[i]);
        });
      }
    }

    if (!this.oldEmbed) {
      const rolesEmbed = new MessageEmbed();

      this.roles.forEach((role, i) => {
        this.roleEmbedFields.push({ name: "\u200b", value: `${roleEmojis[i]} <@&${this.roles[i]}>` });
      });

      rolesEmbed.setTitle("Public Roles").addFields(this.roleEmbedFields);

      const rolesMessage = await channel.send({ embeds: [rolesEmbed] });

      this.roles.forEach(async (role, i) => {
        await rolesMessage.react(roleEmojiUnicodes[i]);
      });
    }
  }

  async handleReaction(bot, reaction, author, remove = false) {
    if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error
      try {
        await reaction.fetch();
      } catch (error) {
        return logger.error("Something went wrong when fetching the message: ", error);
      }
    }

    for (let i = 0; i < this.roles.length; i++) {
      const field = this.oldEmbed.embeds[0].fields[i];
      const emojiName = emoji.getName(reaction.emoji);
      const matchingRole = reaction.message.guild.roles.cache.find(r => field.value.includes(`${emojiName}: <@&${r.id}>`));

      if (matchingRole) {
        const user = await reaction.message.guild.members.cache.get(author.id);

        if (remove) {
          return user.roles.remove(matchingRole);
        }

        return user.roles.add(matchingRole);
      }
    }
  }
}

export = new Roles();
