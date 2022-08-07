import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { gw2api, formatAge, sortAlphabetically, logger } from "../../utils";
import { gameData } from "../../data/";
import { Keys } from "@mbacalan/aurene-database";
import { Command } from "../../types";

class Character implements Command {
  name = "character";
  description = "See your GW2 character information";
  usage = "list/info charname";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('List all your characters')
    )
    .addSubcommand(sub =>
      sub
        .setName('info')
        .setDescription('See information about given character')
        .addStringOption(option =>
          option
            .setName('character')
            .setDescription('Name of the character, case sensitive')
            .setRequired(true)
        )
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const subCommand = interaction.options.getSubcommand();
    const { key, accountName } = await Keys.findOne({ discordId: interaction.user.id });

    if (!key) {
      interaction.reply("I couldn't find a GW2 API key associated with your Discord account!");
      return;
    }

    await interaction.deferReply();

    gw2api.authenticate(key);

    switch (subCommand) {
      case "list": {
        const characters = await gw2api.characters().all();
        // TODO: Add profession icons as emotes
        const characterList = characters
          .map((char) => char.name)
          .slice().sort((a, b) => sortAlphabetically(a, b))
          .join("\n");

        const characterListEmbed = new EmbedBuilder()
          .setTitle(`${accountName}'s Characters`)
          .addFields([{ name: "\u200b", value: characterList }]);

        await interaction.editReply({ embeds: [characterListEmbed] }).catch(() => {
          interaction.editReply("I'm lacking permissions to send an embed!");
        });
      }
        break;

      case "info": {
        const characterName = interaction.options.getString('character')
        const character = await gw2api.characters(characterName).core().get().catch((error) => {
          logger.error(`${error.content.text}: ${characterName}`);
          return false;
        });

        if (!character) {
          interaction.editReply({ content: "couldn't find that character." });
          return;
        }

        const { profession, deaths, age, created, name, gender, race } = character;
        const guild = await gw2api.guild().get(character.guild);
        const title = await gw2api.titles().get(character.title).catch(() => "No Title");
        const professionIcon = gameData.professions[profession.toLowerCase()].icon;
        const deathsPerHour = (deaths / (age / 3600)).toFixed(1);
        const createdAt = new Date(created).toDateString();
        const formattedAge = formatAge(age);

        const characterEmbed = new EmbedBuilder()
          .setTitle(name)
          .setDescription(`${gender} ${race} ${profession}`)
          .setThumbnail(professionIcon)
          .addFields([
            { name: "Level", value: String(character.level) },
            { name: "\u200b", value: "\u200b" },
            { name: "Title", value: title.name ? title.name : title },
            { name: "\u200b", value: "\u200b" },
            { name: "Created At", value: createdAt },
            { name: "Played For", value: formattedAge },
            { name: "\u200b", value: "\u200b" },
            { name: "Deaths", value: String(deaths) },
            { name: "Deaths Per Hour", value: String(deathsPerHour) },
            { name: "\u200b", value: "\u200b" },
            { name: "Representing", value: `${guild.name} [${guild.tag}]` },
          ])

        interaction.editReply({ embeds: [characterEmbed] }).catch(() => {
          interaction.editReply({ content: "I'm lacking permissions to send an embed!" });
        });
      }
    }
  }
}

export = new Character();
