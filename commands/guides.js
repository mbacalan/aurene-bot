module.exports = {
  name: "guide",
  description: "Get some guide links for the raid boss of your choice",
  args: true,
  usage: "bossname",
  execute(message, args) {
    try {
      if (args[0] === "cairn" || args[0] === "cairncer") {
        return message.reply(`\n\nCairn the Indomitable - Raid 2 (Bastion of the Penitent), Boss 1
        \nWiki Guide: https://wiki.guildwars2.com/wiki/Bastion_of_the_Penitent#Cairn_the_Indomitable
        \nVideo Guide: https://www.youtube.com/watch?v=SjzG0qEi20o
        \nGood luck!`);
      } else if (args[0] === "mursaat overseer" || args[0] === "mursaat" || args[0] === "mo") {
        return message.reply(`\n\nMursaat Overseer - Raid 2 (Bastion of the Penitent), Boss 2
        \nWiki Guide: https://wiki.guildwars2.com/wiki/Bastion_of_the_Penitent#Mursaat_Overseer
        \nVideo Guide: https://www.youtube.com/watch?v=pcYEEX6RgDM
        \nGood luck!`);
      } else if (args[0] === "samarog" || args[0] === "sam") {
        return message.reply(`\n\nSamarog - Raid 2 (Bastion of the Penitent), Boss 3
        \nWiki Guide: https://wiki.guildwars2.com/wiki/Bastion_of_the_Penitent#Samarog
        \nVideo Guide: https://www.youtube.com/watch?v=diwPG9Dsrt8
        \nGood luck!`);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
