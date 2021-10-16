import { MessageEmbed } from "discord.js";
import { Keys } from "../../models";
import { Command, CommandParams } from "../../types";
import { gw2api, formatAge, sortAlphabetically, logger } from "../../utils";
import { gameData } from "../../data/";

class Character implements Command {
  name = "character";
  args = true;
  description = "See your GW2 character information";
  usage = "list/info charname";

  async execute({ message, args }: CommandParams) {
    const [arg, ...charName] = args;
    const { key, accountName } = await Keys.findOne({ discordId: message.author.id });

    if (!key) {
      return message.reply("I couldn't find a GW2 API key associated with your Discord account!");
    }

    gw2api.authenticate(key);

    switch (arg) {
      case "list": {
        const characters = await gw2api.characters().all();
        // TODO: Add profession icons as emotes
        const characterList = characters
          .map((char) => char.name)
          .slice().sort((a, b) => sortAlphabetically(a, b))
          .join("\n");

        const characterListEmbed = new MessageEmbed()
          .setTitle(`${accountName}'s Characters`)
          .addField("\u200b", characterList);

        await message.reply({ embeds: [characterListEmbed] }).catch(() => {
          message.reply("I'm lacking permissions to send an embed!");
        });
      }
        break;

      case "info": {
        const characterName = charName.join(" ");
        const character = await gw2api.characters(characterName).core().get().catch((error) => {
          logger.error(`${error.content.text}: ${characterName}`);
        });

        if (!character) return message.reply("couldn't find that character.");

        const { profession, deaths, age, created, name, gender, race } = character;
        const guild = await gw2api.guild().get(character.guild);
        const title = await gw2api.titles().get(character.title).catch(() => "No Title");
        const professionIcon = gameData.professions[profession.toLowerCase()].icon;
        const deathsPerHour = (deaths / (age / 3600)).toFixed(1);
        const createdAt = new Date(created).toDateString();
        const formattedAge = formatAge(age);

        const characterEmbed = new MessageEmbed()
          .setTitle(name)
          .setDescription(`${gender} ${race} ${profession}`)
          .setThumbnail(professionIcon)
          .addField("Level", String(character.level), true)
          .addField("Title", title.name ? title.name : title, true)
          .addField("\u200b", "\u200b", true)
          .addField("Created At", createdAt, true)
          .addField("Played For", formattedAge, true)
          .addField("\u200b", "\u200b", true)
          .addField("Deaths", String(deaths), true)
          .addField("Deaths Per Hour", String(deathsPerHour), true)
          .addField("\u200b", "\u200b", true)
          .addField("Representing", `${guild.name} [${guild.tag}]`);

        message.reply({ embeds: [characterEmbed] }).catch(() => {
          message.reply("I'm lacking permissions to send an embed!");
        });
      }
    }
  }
}

export = new Character();
