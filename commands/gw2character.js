const { Key } = require("../dbModels/models");
const { RichEmbed } = require("discord.js");
const { gw2api } = require("../utils/api");
const { formatAge } = require("../utils/general");
const { professions } = require("../utils/gameData");

module.exports = {
  name: "character",
  args: true,
  description: "See your GW2 account information",
  async execute(message, args) {
    const key = await Key.findOne({ discordId: message.author.id });

    if (!key) {
      message.reply("I couldn't find a GW2 API key associated with your Discord account!");
      throw new Error(`Couldn't find a key associated with ${message.author.username}`);
    }

    gw2api.authenticate(key.key);

    let characterName = args[0];

    if (args[1]) {
      characterName = [args[0], args[1]].join(" ");
    }

    const character = await gw2api.characters(characterName).core().get();
    const guild = await gw2api.guild().get(character.guild);
    const title = await gw2api.titles().get(character.title).catch(() => "No Title");
    const professionIcon = professions[character.profession.toLowerCase()].icon;
    const deathsPerHour = (character.deaths / (character.age / 3600)).toFixed(1);
    const createdAt = new Date(character.created).toDateString();
    const age = formatAge(character.age);

    const characterEmbed = new RichEmbed()
      .setTitle(`${character.name}`)
      .setDescription(`A ${character.race} ${character.gender} ${character.profession}`)
      .setThumbnail(professionIcon)
      .addField("Level", `${character.level}`, true)
      .addField("Title", `${title.name ? title.name : title}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Created at", `${createdAt}`, true)
      .addField("Guild", `${guild.name} [${guild.tag}]`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Deaths", `${character.deaths}`, true)
      .addField("Deaths Per Hour", `${deathsPerHour}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Age", `${age}`);

    message.channel.send(characterEmbed);
  },
};
