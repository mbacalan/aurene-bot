import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Bosses } from "../models";
import { Command } from "../types";

class Guides implements Command {
  name = "guide";
  description = "Get some guide links for the raid boss of your choice";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption(option =>
      option.setName("boss")
        .setDescription("Boss to show the guide for")
        .setRequired(true)
    );

  async execute(interaction: CommandInteraction) {
    const selectedBoss = interaction.options.getString("boss");
    const bossData = await Bosses.findOne({ name: selectedBoss });

    if (!bossData) {
      interaction.reply("I couldn't find info about that boss");
      return;
    }

    const bossName = bossData.name.charAt(0).toUpperCase() + bossData.name.slice(1);

    interaction.reply(`${bossName} - ${bossData.raidIndex}
    \nWiki Guide: ${bossData.wiki}
    \nVideo Guide: ${bossData.video}
    \nGood luck!`);
  }
}

export = new Guides();
