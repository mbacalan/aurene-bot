import { Types, Document } from "mongoose";
import { Client, CommandInteraction, Message, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User } from "discord.js";
import { Keys, Builds, Winners, Guilds } from "../models";
import { Command, IGuild } from "../types";
import { logger, gw2api, buildDbFromApi } from "./";

async function checkNewBuild(bot: Client) {
  const currentBuild = await Builds.findOne({});
  const liveBuild = await gw2api.build().live().get();

  if (currentBuild.build != liveBuild) {
    await gw2api.flushCacheIfGameUpdated();
    await Builds.deleteMany({});
    await Builds.create({ build: liveBuild });

    logger.info("(Re)building API cache");
    bot.user.setStatus("dnd");
    bot.user.setActivity("Building API Cache", { type: "LISTENING" });
    await buildDbFromApi();
    bot.user.setStatus("online");
    bot.user.setActivity("Guild Wars 2");
  }
}

async function checkGiveawayOnStartup(bot: Client, guild: IGuild & Document) {
  if (!guild.giveaways && !guild.giveaways.length) {
    return false;
  }

  const giveawayChannel = bot.channels.cache.get(process.env.GIVEAWAY_CHANNEL) as TextChannel;

  guild.giveaways.forEach(async (giveaway) => {
    const giveawayMessage = await giveawayChannel.messages.fetch(giveaway._id);

    if (!giveawayMessage) {
      return false;
    }

    const entryCollector = createGiveawayEntryCollector(guild, giveawayChannel, giveawayMessage);

    setTimeout(async () => {
      await endGiveaway(giveawayMessage, giveawayChannel);
      entryCollector.stop();
    }, giveaway.endTime - Date.now());
  });
}

function createGiveawayEntryCollector(guild: IGuild & Document, giveawayChannel: TextChannel, giveawayMessage: Message) {
  const entryCollector = giveawayMessage.createReactionCollector({
    filter: reaction => ["✅", "❗"].includes(reaction.emoji.name)
  });

  entryCollector.on("collect", async (reaction, user) => {
    const giveaway = guild.giveaways.id(reaction.message.id);
    const isCreator = giveaway.userId == user.id;

    if (isCreator && reaction.emoji.name == "❗") {
      await endGiveaway(giveawayMessage, giveawayChannel);
      entryCollector.stop();
      return false;
    }

    const entries = giveaway.entries;
    const hasEntered = entries.find(entry => entry.userId == user.id);

    if (hasEntered) {
      return false;
    }

    if (isCreator) {
      await reaction.users.remove(user.id);
      return false;
    }

    entries.push({
      userId: user.id,
      userTag: user.tag,
    });

    await guild.save();
  });

  return entryCollector;
}

async function endGiveaway(giveawayMessage: Message, channel: TextChannel) {
  const guild = await Guilds.findOne({ _id: giveawayMessage.guild.id });
  const giveaway = guild.giveaways.id(giveawayMessage.id);
  const winner = giveaway.entries[giveaway.entries.length * Math.random() | 0];

  if (!winner) {
    await giveawayMessage.edit("This giveaway has ended. Looks like no one entered!");
    await giveaway.remove();
    await guild.save();
    return false;
  }

  const winnerDoc = new Winners({
    _id: new Types.ObjectId(),
    userId: winner.userId,
    userTag: winner.userTag,
    item: giveaway.item,
  });

  winnerDoc.save(async (error) => {
    if (error) {
      logger.error("Error saving winner to database", error);
    }

    guild.giveawayWinners.push({
      _id: winnerDoc._id,
    });

    giveawayMessage.edit(
      `This giveaway has ended. <@${winner.userId}> won ${giveaway.item} from <@${giveaway.userId}>! 🎉`
    );
    channel.send(`Congratulations <@${winner.userId}>, you won **${giveaway.item}** from <@${giveaway.userId}>! 🎉`);
    await giveaway.remove();
    await guild.save();
  });
}

async function validateKey(message: any, key: string) {
  const userId = message.author?.id || message.user.id;
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

function formatAge(age: number) {
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

function sortAlphabetically(a: string, b: string) {
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

async function checkReactionValidity(bot: Client, reaction: MessageReaction | PartialMessageReaction, author: User | PartialUser) {
  const starChannel = bot.channels.cache.get(process.env.STARBOARD_CHANNEL);
  const message = reaction.message;

  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      return logger.error("Something went wrong when fetching the message: ", error);
    }
  }

  if (reaction.emoji.name != "⭐" || message.author.bot || !starChannel) {
    return false;
  }

  if (reaction.emoji.name == "⭐" && message.channel == starChannel || message.author.id == author.id) {
    reaction.remove();
    return false;
  }

  return true;
}

export {
  endGiveaway,
  createGiveawayEntryCollector,
  validateKey,
  formatAge,
  filterExpansions,
  checkNewBuild,
  checkGiveawayOnStartup,
  sortAlphabetically,
  checkReactionValidity,
};
