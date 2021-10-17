import { Command, CommandParams } from "../types";

class Missions implements Command {
  name = "missions";
  aliases = ["gm", "guildmissions"];
  description = "Alert members for joining Guild Missions and provide useful info to them";

  async execute({ message, isOwner, isRanking }: CommandParams) {
    // TODO: Investigate negative checks for when both isOwner and isRanking is needed
    if (isOwner || isRanking) {

      // TODO: Dynamic commendation emote / no emote
      return message.reply(
        {
          content: "Grab your omnomberry bars and apple ciders, it's time for Guild Missions!" +
          "\nCome to our Guild Hall to join the squad." +
          "\n\nHere are the links to help you with Trek and Bounty missions:" +
          "\n<https://wiki.guildwars2.com/wiki/Guild_Trek#Possible_locations>" +
          "\n<https://wiki.guildwars2.com/wiki/Guild_Bounty#Possible_targets>" +
          "\n\nLet's go get those <:commend:528271266864431134>'s!"
        }
      );
    }

    return message.reply("Only the owner, leaders and officers can use this command.");
  }
}

export = new Missions();
