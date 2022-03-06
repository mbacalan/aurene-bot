import { SlashCommandBuilder } from "@discordjs/builders";
import { redisClient, logger } from "../utils";
import { Guilds } from "../models";
import { Interaction } from "../types";
import { CommandInteraction } from "discord.js";

class Prefix implements Interaction {
  name = "prefix";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription("Change bot's prefix")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option
        .setName("prefix")
        .setDescription("Enter a new prefix")
      );

  async execute(interaction: CommandInteraction) {
    const newPrefix = interaction.options.getString("prefix");

    if (!newPrefix) {
      redisClient.get("prefix", (err, val) => {
        if (err) {
          return logger.error("Error reading from Redis: ", err);
        }

        interaction.reply({ content: `Current prefix is: "${val}"`, ephemeral: true });
      });

      return;
    }

    // TODO: Set isOwner & isRanking permissions
    if (newPrefix.length > 1) {
      return interaction.reply("Prefix can only be 1 character long.");
    }

    const guild = await Guilds.findOne({ _id: interaction.guild.id });

    guild.config.prefix = newPrefix;
    guild.save();
    redisClient.set("prefix", newPrefix);
    interaction.reply({ content: `Prefix set to: "${newPrefix}"`, ephemeral: true });
  }
}

export = new Prefix();
