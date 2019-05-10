const { Bosses } = require("../dbModels/models");

module.exports = {
  name: "guide",
  description: "Get some guide links for the raid boss of your choice",
  args: true,
  usage: "bossname",
  async execute(message, args) {

    let boss = await Bosses.findOne({ name: args.join(" ") });
    if (!boss) {
      boss = await Bosses.findOne({ alias: args[0] });
    }

    try {
      if (boss) {
        const bossName = boss.name.charAt(0).toUpperCase() + boss.name.slice(1);
        return message.channel.send(`${bossName} - ${boss.raidIndex}
      \nWiki Guide: ${boss.wiki}
      \nVideo Guide: ${boss.video}
      \nGood luck!`);
      } else {
        message.reply("I couldn't find info about that boss");
      }
    } catch (err) {
      console.log(err);
    }
  },
};
