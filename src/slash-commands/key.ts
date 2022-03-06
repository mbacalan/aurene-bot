import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { gw2api, logger, validateKey } from "../utils";
import { Keys } from "../models";
import { Command } from "../types";

class Key implements Command {
  name = "key";
  description = "Add, view or delete your GW2 API key";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("Add a GW2 API key")
        .addStringOption(option =>
          option
            .setName("key")
            .setDescription("The GW2 API key you want to add")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("view")
        .setDescription("View your saved GW2 API key")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("delete")
        .setDescription("Delete your saved GW2 API key")
    );

  async execute(interaction: CommandInteraction) {
    const subCommand = interaction.options.getSubcommand();

    interaction.deferReply({ ephemeral: true });

    switch (subCommand) {
      case "add": {
        const key = interaction.options.getString("key");
        const keyIsValid = await validateKey(interaction, key);

        if (!keyIsValid) {
          interaction.editReply(
            { content: "Your key is invalid. Please double check and don't wrap it in any brackets, quotes etc." }
          );

          return;
        };

        gw2api.authenticate(key);

        const tokenInfo = await gw2api.tokeninfo().get(key).catch(() => {
          interaction.editReply(
            { content: "There is either an issue with the API or your key. Please try again later." }
          );
        });

        try {
          const account = await gw2api.account().get(key);

          await Keys.create({
            discordId: interaction.user.id,
            keyName: tokenInfo.name ? tokenInfo.name : "",
            accountName: account.name,
            permissions: tokenInfo.permissions,
            key,
          });

          await interaction.editReply({ content: "Your key has been saved!" });
        } catch (error) {
          interaction.editReply("There was an issue while trying to save your key.");
          logger.error("Error in key command, argument add", error);
        }
      }
        break;

      case "view": {
        const key = await Keys.findOne({ discordId: interaction.user.id });

        if (!key) {
          interaction.editReply("Couldn't find a saved key to show!");
          return;
        }

        const keyEmbed = new MessageEmbed()
          .setColor("#1a9306")
          .setTitle(key.keyName)
          .addField("Key", key.key)
          .addField("Permissions", key.permissions.join(", "));

        interaction.editReply({ embeds: [keyEmbed] }).catch(() => {
          interaction.editReply({ content: `Saved key is ${key.keyName} - ${key.key}` });
        });
      }
        break;

      case "delete": {
        const { key } = await Keys.findOne({ discordId: interaction.user.id });

        if (!key) {
          interaction.editReply("Couldn't find a saved key to delete!");
          return;
        }

        try {
          await Keys.deleteOne({ key });
          interaction.editReply({ content: "Your key has been deleted!" });
        } catch (error) {
          interaction.editReply({
            content: "There was an error with removing your key. Please contact my author" }
          );
          logger.error("Error while deleting key", error);
        }
      }
    }
  }
}

export = new Key();
