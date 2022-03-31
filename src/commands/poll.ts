import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { pollEmojis, pollEmojiUnicodes } from "../data/";
import { Command } from "../types";

class Poll implements Command {
  name = "poll";
  description = "Make a poll with given arguments";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("The title of the poll")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("options")
        .setDescription("The options for the poll, seperated with a -")
        .setRequired(true)
    )
    .addMentionableOption(option =>
      option
        .setName("role")
        .setDescription("Optionally, mention a role with the poll")
    );

  async execute(interaction: CommandInteraction) {
    const role = interaction.options.getMentionable("role");
    const question = interaction.options.getString("title");
    const options = interaction.options.getString("options");

    const pollEmbed = new MessageEmbed().setTitle(question);
    const parsedOptions = options.split("-");
    const pollOptions = [];

    for (let i = 0; i < parsedOptions.length; i++) {
      pollOptions.push({ name: "\u200b", value: `${pollEmojis[i]} ${parsedOptions[i]}` });
    }

    pollEmbed.addFields(pollOptions);

    const poll = await interaction.channel.send({
      content: role?.toString() || "Here's a poll for you!",
      embeds: [pollEmbed]
    }).catch(() => {
      interaction.reply("I'm lacking permissions to send an embed!");
    });

    if (!poll) return;

    interaction.deferReply({ ephemeral: true });

    for (let i = 0; i < parsedOptions.length; i++) {
      await poll.react(pollEmojiUnicodes[i]);
    }

    interaction.editReply({ content: "Poll created!" });
  }
}

export = new Poll();
