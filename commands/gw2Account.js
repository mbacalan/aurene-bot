const { callApi } = require("../utils/api");
const { Key } = require("../dbModels/models");
const { RichEmbed } = require("discord.js");

module.exports = {
  name: "gw2account",
  args: false,
  description: "See your GW2 account information",
  async execute(message) {
    const key = await Key.findOne({ discordId: message.author.id });

    if (!key) {
      throw new Error(`Couldn't find a key associated with ${message.author.username}`);
    }

    const account = await callApi("account", key.key);
    const guild = await callApi(`guild/${account.guild_leader}`, key.key);
    const world = await callApi(`worlds/${account.world}`);

    const infoEmbed = new RichEmbed()
      .setTitle(`${account.name}`)
      .addField("Created at", `${new Date(account.created).toDateString()}`, true)
      .addField("Leader of", `${guild.name} [${guild.tag}]`, true)
      .addField("Owns", `${account.access.slice(1).join(", ")}`)
      .addField("Fractal Level", `${account.fractal_level}`, true)
      .addField("World", `${world.name}`, true)
      .addField("WvW Rank", `${account.wvw_rank}`, true)
      .addField("Commander", `${account.commander ? "Yes" : "No"}`, true);

    message.channel.send(infoEmbed);
  },
};
