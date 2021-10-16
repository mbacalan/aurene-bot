import { Bosses } from "../models";
import { Command, CommandParams } from "../types";

class Guides implements Command {
  name = "guide";
  description = "Get some guide links for the raid boss of your choice";
  args = true;
  usage = "bossname";

  async execute({ message, args }: CommandParams) {
    const boss = await Bosses.findOne({ name: args.join(" ") });

    if (!boss) {
      return message.reply("I couldn't find info about that boss");
    }

    const bossName = boss.name.charAt(0).toUpperCase() + boss.name.slice(1);

    message.reply(`${bossName} - ${boss.raidIndex}
    \nWiki Guide: ${boss.wiki}
    \nVideo Guide: ${boss.video}
    \nGood luck!`);
  }
}

export = new Guides();
