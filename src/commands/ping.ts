import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../types";

class Ping implements Command {
  name = "ping";
  description = "Replies with Pong!";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(interaction: ChatInputCommandInteraction) {
    const pingEmbed = new EmbedBuilder()
      .setColor("#1a9306")
      .setTitle("Pong 🏓")
      .addFields([
        { name: "Websocket Latency:", value: `${Math.round(interaction.client.ws.ping)}ms` }
      ]);

    interaction.reply({ embeds: [pingEmbed] }).catch(() => {
      interaction.reply(`Websocket latency is ${Math.round(interaction.client.ws.ping)}ms.`);
    });
  }
}

export = new Ping();
