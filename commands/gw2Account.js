const { Key } = require("../dbModels/models");
const { RichEmbed } = require("discord.js");
const { gw2api } = require("../utils/api");

module.exports = {
  name: "account",
  args: false,
  description: "See your GW2 account information",
  async execute(message) {
    const key = await Key.findOne({ discordId: message.author.id });

    if (!key) {
      message.reply("I couldn't find a GW2 API key associated with your Discord account!");
      throw new Error(`Couldn't find a key associated with ${message.author.username}`);
    }

    gw2api.authenticate(key.key);

    const account = await gw2api.account().get();
    // TODO: Set primary guild
    const guild = await gw2api.guild().get(account.guild_leader[0]);
    const world = await gw2api.worlds().get(account.world);

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
