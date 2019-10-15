const { Entries, Giveaway, Winner } = require("../dbModels/models");

module.exports = {
  logger(logs) {
    if (Array.isArray(logs)) {
      logs.forEach(function log(str) {
        console.log(str);
      });
    }

    if (typeof logs == "string") {
      console.log(logs);
    }
  },

  clearGiveawayAndEntries() {
    Giveaway.collection.deleteMany({});
    Entries.collection.deleteMany({});
  },

  createWinner(winner, item) {
    Winner.create({
      userId: winner.userId,
      userName: winner.userName,
      discriminator: winner.discriminator,
      item: item,
    });
  },

  async pickWinner() {
    const winner = await Entries.aggregate([{ $sample: { size: 1 } }]);
    return winner[0];
  },

  async endGiveaway(creator, channel, item) {
    const winner = await this.pickWinner(Entries);

    if (!winner) {
      channel.send("Looks like no one entered the giveaway :(");
      console.error(`No one entered the giveaway of ${item}.`);
      return this.clearGiveawayAndEntries(Giveaway, Entries);
    }

    this.createWinner(winner, item);
    channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${creator.userName}#${creator.discriminator}!`);
    console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
    this.clearGiveawayAndEntries();
  },

  async createGiveaway(message, item, duration, endTime) {
    await Giveaway.create({
      userId: message.author.id,
      userName: message.author.username,
      discriminator: message.author.discriminator,
      creationTime: `${message.createdAt}`,
      item: item,
      duration: duration,
      endTime: endTime,
    });
    console.log(`Created giveaway for ${item}, which will go on for ${duration}.`);
  },
};
