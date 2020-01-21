const mongoose = require("mongoose");

// Declare schemas
const bossSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  wiki: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  raidIndex: {
    type: String,
    required: true,
  },
});

const entrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  discriminator: {
    type: Number,
    required: true,
  },
});

const giveawaySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  discriminator: {
    type: Number,
    required: true,
  },
  creationTime: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
});

const winnerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  discriminator: {
    type: Number,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
});

const keySchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
  },
  keyName: {
    type: String,
    required: false,
  },
  accountName: {
    type: String,
    required: true,
  },
  permissions: {
    type: Array,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
});

const buildSchema = new mongoose.Schema({
  build: {
    type: String,
    required: true,
  },
});

// Declare models based on schemas
const Bosses = mongoose.model("Bosses", bossSchema);
const Giveaway = mongoose.model("Giveaway", giveawaySchema);
const Entries = mongoose.model("Entries", entrySchema);
const Winner = mongoose.model("Winner", winnerSchema);
const Key = mongoose.model("Key", keySchema);
const Build = mongoose.model("Build", buildSchema);

// Export them for use as required
module.exports = { Bosses, Giveaway, Entries, Winner, Key, Build };
