const { Keys, Worlds } = require("../../dbModels");
const { MessageEmbed } = require("discord.js");
const { gw2api, getLeadingGuilds } = require("../../utils/api");
const { formatAge, filterExpansions } = require("../../utils/general");

class Account {
  constructor() {
    this.name = "account";
    this.args = false;
    this.description = "See your GW2 account information";
  }

  async execute(message) {
    const key = await Keys.findOne({ discordId: message.author.id });

    if (!key) {
      return message.reply("I couldn't find a GW2 API key associated with your Discord account!");
    }

    gw2api.authenticate(key.key);

    const account = await gw2api.account().get();
    const { created, name, wvw_rank, fractal_level, commander } = account;
    const world = await Worlds.findOne({ id: account.world });
    const age = formatAge(account.age);
    const guilds = await getLeadingGuilds(account);
    const expansions = filterExpansions(account);
    const creationDate = new Date(created).toDateString();
    const pvp = await gw2api.account().pvp().stats().get();
    const { pvp_rank } = pvp;

    const accountEmbed = new MessageEmbed()
      .setTitle(name)
      .addField("Created at", creationDate, true)
      .addField("Age", age, true)
      .addField("\u200b", "\u200b", true)
      .addField("Has Expansions", expansions, true)
      .addField("World", world.name, true)
      .addField("\u200b", "\u200b", true)
      .addField("WvW Rank", wvw_rank, true)
      .addField("PvP Rank", pvp_rank, true)
      .addField("\u200b", "\u200b", true)
      .addField("Fractal Level", fractal_level, true)
      .addField("Commander", commander ? "Yes" : "No", true)
      .addField("\u200b", "\u200b", true)
      .addField("Leads", guilds, true);

    await message.channel.send(accountEmbed).catch(() => {
      message.channel.send("I'm lacking permissions to send an embed!");
    });
  }
}

module.exports = new Account;
