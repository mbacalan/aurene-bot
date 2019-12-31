const { Entries, Giveaway, Winner, Key } = require("../dbModels/models");

async function createGiveaway(message, item, duration, endTime) {
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
}

async function createWinner(winner, item) {
  await Winner.create({
    userId: winner.userId,
    userName: winner.userName,
    discriminator: winner.discriminator,
    item: item,
  });
}

async function createKey(message, tokenInfo, account, key) {
  await Key.create({
    discordId: message.author.id,
    keyName: tokenInfo.name,
    accountName: account.name,
    permissions: tokenInfo.permissions,
    key,
  });
}

async function pickWinner() {
  const winner = await Entries.aggregate([{ $sample: { size: 1 } }]);
  return winner[0];
}

async function clearGiveawayAndEntries() {
  await Giveaway.collection.deleteMany({});
  await Entries.collection.deleteMany({});
}

module.exports = {
  createGiveaway,
  createWinner,
  createKey,
  pickWinner,
  clearGiveawayAndEntries,
};
