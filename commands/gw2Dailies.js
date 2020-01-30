const { gw2api } = require("../utils/api");
const { RichEmbed } = require("discord.js");
const { db } = require("../utils/db");

class Dailies {
  constructor() {
    this.name = "dailies";
    this.description = "See today's dailies";
  }

  async execute(message) {
    const dailies = await gw2api.achievements().daily().get();

    const pve = await Promise.all(
      dailies.pve.filter(daily => daily.level.max === 80).map(async (daily) => {
        return await db.collection("gw2.achievements").findOne({ id: daily.id })
          .then(result => result.name);
      })
    );

    const pvp = await Promise.all(
      dailies.pvp.filter(daily => daily.level.max === 80).map(async (daily) => {
        return await db.collection("gw2.achievements").findOne({ id: daily.id })
          .then(result => result.name);
      })
    );

    const wvw = await Promise.all(
      dailies.wvw.filter(daily => daily.level.max === 80).map(async (daily) => {
        return await db.collection("gw2.achievements").findOne({ id: daily.id })
          .then(result => result.name);
      })
    );

    const fractals = await Promise.all(
      dailies.fractals.filter(daily => daily.level.max === 80).map(async (daily) => {
        return await db.collection("gw2.achievements").findOne({ id: daily.id })
          .then(result => result.name);
      })
    );

    const DailiesEmbed = new RichEmbed()
      .setTitle("Dailies")
      .addField("PvE", pve.join("\n"))
      .addField("PvP", pvp.join("\n"))
      .addField("WvW", wvw.join("\n"))
      .addField("WvW", fractals.join("\n"));

    await message.channel.send(DailiesEmbed).catch(() => {
      message.channel.send("I'm lacking permissions to send an embed!");
    });
  }
}

module.exports = new Dailies;
