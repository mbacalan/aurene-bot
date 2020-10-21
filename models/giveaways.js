const mongoose = require("mongoose");

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

const Giveaways = mongoose.model("Giveaways", giveawaySchema);

module.exports = Giveaways;
