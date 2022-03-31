import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../types";

class Missions implements Command {
  name = "missions";
  description = "Alert members for joining Guild Missions and provide useful info to them";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(interaction: CommandInteraction) {
    // TODO: Add owner / ranking permissons
    return interaction.reply(
      {
        content: "Grab your omnomberry bars and apple ciders, it's time for Guild Missions!" +
        "\nCome to our Guild Hall to join the squad." +
        "\n\nHere are the links to help you with Trek and Bounty missions:" +
        "\n<https://wiki.guildwars2.com/wiki/Guild_Trek#Possible_locations>" +
        "\n<https://wiki.guildwars2.com/wiki/Guild_Bounty#Possible_targets>" +
        "\n\nLet's go get those commendations!"
      }
    );
  }
}

export = new Missions();
