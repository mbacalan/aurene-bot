const { Entries, Giveaway, Winner, Key } = require("../dbModels/models");
const logger = require("./logger");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));

const db = mongoose.connection;

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

  logger.info(`Created giveaway for ${item}, which will go on for ${duration}.`);
}

async function createEntry(message) {
  await Entries.create({
    userId: message.author.id,
    userName: message.author.username,
    discriminator: message.author.discriminator,
    entryTime: `${message.createdAt}`,
  });
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
    keyName: tokenInfo.name ? tokenInfo.name : "",
    accountName: account.name,
    permissions: tokenInfo.permissions,
    key,
  });
}

async function deleteKey(message) {
  const userKey = await Key.findOne({ discordId: message.author.id });

  if (!userKey) {
    return message.reply("couldn't find a key you added to delete!");
  }

  try {
    await Key.deleteOne(userKey);
    message.reply("your key has been deleted!");
  } catch (error) {
    message.reply("there was an error with removing your key. Please contact my author");
    logger.error("Error while deleting key", error);
  }
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
  db,
  createGiveaway,
  createEntry,
  createWinner,
  createKey,
  deleteKey,
  pickWinner,
  clearGiveawayAndEntries,
};
