const mongoose = require("mongoose");
const configSchema = require("./config");
const giveawaySchema = require("./giveaways");

const guildSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  config: {
    type: configSchema,
    default: () => ({}),
  },
  giveaways: {
    type: [giveawaySchema],
    required: false,
  },
  giveawayWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Winners" }],
});

const Guild = mongoose.model("guild", guildSchema);

module.exports = Guild;
