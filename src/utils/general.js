const moment = require("moment");
const logger = require("./logger");
const { gw2api } = require("./api");
const { Entries, Giveaways, Keys, Builds } = require("../models");
const { createWinner, clearGiveawayAndEntries } = require("./db");
const { buildDbFromApi } = require("./caching");

async function checkNewBuild(bot) {
  const currentBuild = await Builds.findOne({});
  const liveBuild = await gw2api.build().live().get();

  if (currentBuild.build != liveBuild) {
    await gw2api.flushCacheIfGameUpdated();
    await Builds.deleteMany({});
    await Builds.create({ build: liveBuild });

    logger.info("(Re)building API cache");
    await bot.user.setStatus("dnd");
    await bot.user.setActivity("Building API Cache", { type: "LISTENING" });
    await buildDbFromApi();
    await bot.user.setStatus("online");
    await bot.user.setActivity("Guild Wars 2");
  }
}

async function checkGiveawayOnStartup(bot) {
  const giveawayChannel = bot.channels.cache.get(process.env.GIVEAWAY_CHANNEL);
  const giveaway = await Giveaways.find({});

  if (giveaway[0]) {
    const item = giveaway[0].item;
    const timeout = giveaway[0].endTime - new Date();

    setTimeout(() => endGiveaway(giveaway[0].userId, giveawayChannel, item), timeout);
  }
}

async function endGiveaway(creator, channel, item) {
  const winner = await Entries.aggregate([{ $sample: { size: 1 } }]).then(doc => doc[0]);

  if (!winner) {
    channel.send("Looks like no one entered the giveaway :(");
    logger.info(`No one entered the giveaway of ${item}.`);
    return await clearGiveawayAndEntries(Giveaways, Entries);
  }

  await createWinner(winner, item);
  channel.send(`Congratulations <@${winner.userId}>, you won **${item}** from <@${creator}>! 🎉`);
  logger.info(`The giveaway for ${item} ended, ${winner.userName}#${winner.discriminator} won.`);
  await clearGiveawayAndEntries();
}

async function initGiveawayTimeout(creator, channel, item) {
  const giveaway = await Giveaways.findOne({});
  const endTime = giveaway.endTime;
  const duration = endTime - moment();

  return setTimeout(async () => {
    await endGiveaway(creator, channel, item);
  }, duration);
}

async function validateKey(message, key) {
  const userId = message.author.id;
  const userHasKey = await Keys.findOne({ discordId: userId });
  const keyExists = await Keys.findOne({ key: key });

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
    message.reply("you already have a registered key. You can use the delete argument to delete it.");
    return false;
  }

  if (keyExists) {
    message.delete();
    message.reply("this key already exists in the database.");
    return false;
  }

  return true;
}

function formatAge(age) {
  const hours = Math.floor(age / 3600);
  const minutes = Math.round((age % 3600) / 60);

  if (hours) {
    return `${hours} hours ${minutes} minutes`;
  }

  return `${minutes} minutes`;
}

function filterExpansions(account) {
  return account.access
    .filter(i => !["PlayForFree", "GuildWars2"].includes(i))
    .map(i => i.replace(/([a-z])([A-Z])/g, "$1 $2"))
    .join("\n");
}

function sortAlphabetically(a, b) {
  const A = a.toLowerCase();
  const B = b.toLowerCase();

  if (A < B) {
    return -1;
  }

  if (A > B) {
    return 1;
  }

  return 0;
}

async function checkReactionValidity(bot, reaction, author) {
  const starChannel = bot.channels.cache.get(process.env.STARBOARD_CHANNEL);
  const message = reaction.message;

  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      return logger.error("Something went wrong when fetching the message: ", error);
    }
  }

  if (reaction.emoji.name !== "⭐" || message.author.bot || !starChannel) {
    return false;
  }

  if (reaction.emoji.name === "⭐" && message.channel === starChannel || message.author.id === author.id) {
    reaction.remove();
    return false;
  }

  return true;
}

module.exports = {
  endGiveaway,
  validateKey,
  formatAge,
  filterExpansions,
  initGiveawayTimeout,
  checkNewBuild,
  checkGiveawayOnStartup,
  sortAlphabetically,
  checkReactionValidity,
};
