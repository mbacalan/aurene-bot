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

  clearGiveawayAndEntries(giveawayDb, entriesDb) {
    giveawayDb.collection.deleteMany({});
    entriesDb.collection.deleteMany({});
  },

  createWinner(winnerDb, winner, item) {
    winnerDb.create({
      userId: winner.userId,
      userName: winner.userName,
      discriminator: winner.discriminator,
      item: item,
    });
  },

  async pickWinner(entriesDb) {
    const winner = await entriesDb.aggregate([{ $sample: { size: 1 } }]);
    return winner[0];
  },

  async endGiveaway(winnerDb, creator, channel, item) {
    const winner = await this.pickWinner();

    if (!winner) {
      channel.send("Looks like no one entered the giveaway :(");
      console.error(`No one entered the giveaway of ${item}.`);
      return this.clearGiveawayAndEntries();
    }

    this.createWinner(winnerDb, winner, item);
    channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${creator.userName}#${creator.discriminator}!`);
    console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
    this.clearGiveawayAndEntries();
  },

  async createGiveaway(giveawayDb, message, item, duration, endTime) {
    await giveawayDb.create({
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
