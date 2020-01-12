const { Key } = require("../dbModels/models");
const { RichEmbed } = require("discord.js");
const { gw2api, getLeadingGuilds } = require("../utils/api");
const { formatAge, filterExpansions } = require("../utils/general");

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
    const pvp = await gw2api.account().pvp().stats().get();
    const world = await gw2api.worlds().get(account.world);
    const age = formatAge(account.age);
    const guilds = await getLeadingGuilds(account);
    const expansions = filterExpansions(account);
    const creationDate = new Date(account.created).toDateString();

    const accountEmbed = new RichEmbed()
      .setTitle(`${account.name}`)
      .addField("Created at", `${new Date(account.created).toDateString()}`, true)
      .addField("Age", `${age}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Has Expansions", `${expansions}`, true)
      .addField("World", `${world.name}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("WvW Rank", `${account.wvw_rank}`, true)
      .addField("PvP Rank", `${pvp.pvp_rank}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Fractal Level", `${account.fractal_level}`, true)
      .addField("Commander", `${account.commander ? "Yes" : "No"}`, true)
      .addField("\u200b", "\u200b", true)
      .addField("Leads", `${guild.name} [${guild.tag}]`, true);

    message.channel.send(accountEmbed);
  },
};
