const { Entries, Giveaway, Key } = require("../dbModels/models");
const { createWinner, pickWinner, clearGiveawayAndEntries } = require("./db");

async function endGiveaway(creator, channel, item) {
  const giveaway = await Giveaway.find({});
  const winner = await pickWinner(Entries);

  if (!giveaway) return false;

  if (!winner) {
    channel.send("Looks like no one entered the giveaway :(");
    console.log(`No one entered the giveaway of ${item}.`);
    return await clearGiveawayAndEntries(Giveaway, Entries);
  }

  await createWinner(winner, item);
  channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from ${creator.userName}#${creator.discriminator}!`);
  console.log(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
  await clearGiveawayAndEntries();
}

async function validateKey(message, key) {
  const userId = message.author.id;
  const userHasKey = await Key.findOne({ discordId: userId });
  const keyExists = await Key.findOne({ key: key });

  if (!key) {
    message.reply("you didn't provide a key!");
    return false;
  }

  if (key.length > 74) {
    message.delete();
    message.reply("your key is invalid, it should be a maximum of 74 characters.");
    return false;
  }

  if (userHasKey) {
    message.delete();
    message.reply("you already have a registered key. You can use the delete arguement to delete it.");
    return false;
  }

  if (keyExists) {
    message.delete();
    message.reply("this key already exists in the database.");
    return false;
  }

  return true;
}

module.exports = {
  endGiveaway,
  validateKey,
};
