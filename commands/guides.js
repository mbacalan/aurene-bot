const { Bosses } = require("../dbModels");
// const logger = require("../utils/logger");

class Guides {
  constructor() {
    this.name = "guide";
    this.description = "Get some guide links for the raid boss of your choice";
    this.args = true;
    this.usage = "bossname";
  }

  async execute(message, args) {
    const boss = await Bosses.findOne({ name: args.join(" "), alias: args[0] });

    // if (!boss) {
    //   boss = await Bosses.findOne({ alias: args[0] });
    // }

    // try {
    if (boss) {
      const bossName = boss.name.charAt(0).toUpperCase() + boss.name.slice(1);
      return message.channel.send(`${bossName} - ${boss.raidIndex}
    \nWiki Guide: ${boss.wiki}
    \nVideo Guide: ${boss.video}
    \nGood luck!`);
    } else {
      message.reply("I couldn't find info about that boss");
    }
    // } catch (error) {
    //   logger.error("Error in guides command", error);
    // }
  }
}

module.exports = new Guides;
