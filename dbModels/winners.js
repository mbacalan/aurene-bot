const mongoose = require("mongoose");

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

const Winners = mongoose.model("Winners", winnerSchema);

module.exports = Winners;
