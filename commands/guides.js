const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
}));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const Bosses = require("../dbModels/bosses");

module.exports = {
  name: "guide",
  description: "Get some guide links for the raid boss of your choice",
  args: true,
  usage: "bossname",
  async execute(message, args) {

    async function bossInfo() {
      let boss = await Bosses.findOne({ name: args.join(" ") });
      if (!boss) {
        boss = await Bosses.findOne({ alias: args[0] });
      }
      const bossName = boss.name.charAt(0).toUpperCase() + boss.name.slice(1);
      return message.channel.send(`${bossName} - ${boss.raidIndex}
      \nWiki Guide: ${boss.wiki}
      \nVideo Guide: ${boss.video}
      \nGood luck!`);
    }

    try {
      if (args[0] === "cairn" || args[0] === "cairncer") {
        return bossInfo();
      } else if (args[0] === "mursaat" && args[1] === "overseer" || args[0] === "mo") {
        return bossInfo();
      } else if (args[0] === "samarog" || args[0] === "sam") {
        return bossInfo();
      } else if (args[0] === "vale" && args[1] === "guardian" || args[0] === "vg") {
        return bossInfo();
      } else if (args[0] === "gorseval" || args[0] === "gorse") {
        return bossInfo();
      } else if (args[0] === "sabetha" || args[0] === "sab") {
        return bossInfo();
      } else if (args[0] === "slothasor" || args[0] === "sloth") {
        return bossInfo();
      } else if (args[0] === "bandit" && args[1] === "trio" || args[0] === "trio") {
        return bossInfo();
      } else if (args[0] === "matthias" || args[0] === "matt") {
        return bossInfo();
      } else if (args[0] === "escort" && args[1] === "glenna" || args[0] === "escort") {
        return bossInfo();
      } else if (args[0] === "keep" && args[1] === "construct" || args[0] === "kc") {
        return bossInfo();
      } else if (args[0] === "xera" || args[0] === "xera") {
        return bossInfo();
      } return message.reply("I couldn't find info about that boss");
    } catch (err) {
      console.log(err);
    }
  },
};
