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

    const characterName = args[1] ? [args[0], args[1]].join(" ") : args[0];
    const character = await gw2api.characters(characterName).core().get().catch((error) => {
      message.reply("couldn't find that character.");
      throw new Error(`${error.content.text} ${characterName}`);
    });
    const guild = await gw2api.guild().get(character.guild);
    const title = await gw2api.titles().get(character.title).catch(() => "No Title");
    const professionIcon = professions[character.profession.toLowerCase()].icon;
    const deathsPerHour = (character.deaths / (character.age / 3600)).toFixed(1);
    const createdAt = new Date(character.created).toDateString();
    const age = formatAge(character.age);

    const characterEmbed = new RichEmbed()
      .setTitle(character.name)
      .setDescription(`${character.gender} ${character.race} ${character.profession}`)
      .setThumbnail(professionIcon)
      .addField("Level", character.level, true)
      .addField("Title", title.name ? title.name : title, true)
      .addField("\u200b", "\u200b", true)
      .addField("Created At", createdAt, true)
      .addField("Played For", age, true)
      .addField("\u200b", "\u200b", true)
      .addField("Deaths", character.deaths, true)
      .addField("Deaths Per Hour", deathsPerHour, true)
      .addField("\u200b", "\u200b", true)
      .addField("Representing", `${guild.name} [${guild.tag}]`);

    message.channel.send(characterEmbed);
  },
};
