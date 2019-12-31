const { Entries, Giveaway, Key } = require("../dbModels/models");
const { createWinner, pickWinner, clearGiveawayAndEntries } = require("./db");

async function endGiveaway(creator, channel, item) {
  const winner = await pickWinner(Entries);

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

async function checkKey(message, key) {
  if (!key) {
    message.reply("you didn't provide a key!");
    return false;
  }

  if (key.length > 74) {
    message.delete();
    message.reply("your key is invalid, it should be a maximum of 74 characters.");
    return false;
  }

  if (await Key.findOne({ key: key })) {
    message.delete();
    message.reply("this key already exists in the database.");
    return false;
  }

  return true;
}

module.exports = {
  endGiveaway,
  checkKey,
};
