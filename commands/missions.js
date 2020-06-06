const logger = require("../utils/logger");

class Missions {
  constructor() {
    this.name = "missions";
    this.aliases = ["gm", "guildmissions"];
    this.description = "Alert members for joining Guild Missions and provide useful info to them";
  }

  async execute(message, isOwner, isRanking) {
    try {
      // TODO: Investigate negative checks for when both isOwner and isRanking is needed
      if (isOwner || isRanking) {
        const missionsChannel = message.client.channels.cache.get(process.env.MISSIONS_CHANNEL);
        const membersToMention = missionsChannel.members.array().map((member) => `<@!${member.id}>`);

        return message.channel.send(
          `${membersToMention.join(", ")}, grab your omnomberry bars and apple ciders, it's time for Guild Missions!` +
          "\nCome to our Guild Hall to join the squad." +
          "\n\nHere are the links to help you with Trek and Bounty missions:" +
          "\n<https://wiki.guildwars2.com/wiki/Guild_Trek#Possible_locations>" +
          "\n<https://wiki.guildwars2.com/wiki/Guild_Bounty#Possible_targets>" +
          "\n\nLet's go get those <:commend:528271266864431134>'s!"
        );
      }

      return message.reply("only the owner, leaders and officers can use this command.");
    } catch (error) {
      logger.error("Error in missions command: ", error);
    }
  }
}

module.exports = new Missions;
