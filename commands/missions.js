const { prefix } = require("../bot_config.json");

module.exports = {
  name: "missions",
  aliases: ["gm", "guildmissions", "mission"],
  args: true,
  description: "Alert members for starting Guild Missions and provide useful info to them",
  execute(message, args) {
    try {
      if (args[0] === "start") {
        if (!args[1]) {
          message.channel.send(`@everyone grab your omnomberry bars and apple ciders, it's time for Guild Missions! Come to our Guild Hall, join the squad and the voice channel, if you can.
          \nHere are the links to help you with Trek and Bounty missions:
          https://wiki.guildwars2.com/wiki/Guild_Trek#Possible_locations
          https://wiki.guildwars2.com/wiki/Guild_Bounty#Possible_targets
          If you need further help, you can use \`\`${prefix}mission trek\`\` and \`\`${prefix}missions bounty\`\` commands for more info.
          \nLet's go get those <:commendation:326054375317307402>'s!`);
        } else if (args[1]) {
          message.channel.send(`@everyone ready your omnomberry bars and apple ciders, Guild Missions are starting in **${args[1]}**! We'll meet at our Guild Hall, create a squad and move on from there.`);
        }
      } else if (args[0] === "bounty" || args[0] === "Bounty") {
        message.channel.send(`\nGuild Bounties are open world guild missions where members work together to kill targets across Tyria within 10-20 minutes. These NPCs are randomly chosen from a short list.
        \nPlease check https://wiki.guildwars2.com/wiki/Guild_Bounty#Possible_targets to see how/where you can find the chosen target and bring justice to them.
        \nIf you have guild mates with you, wait for them to come along before you attack the target. Good luck!`);
      } else if (args[0] === "trek" || args[0] === "Trek") {
        message.channel.send(`\nGuild Treks are open world guild missions where members work together to find several locations across Tyria within a set time limit. These locations are randomly chosen from a list of 180 possible locations.
        \nPlease check https://wiki.guildwars2.com/wiki/Guild_Trek#Possible_locations to see how/where you can find the chosen trek.
        \nIf you're not doing a trek alone, wait for everyone else to come before you interact with it. Good luck!`);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
