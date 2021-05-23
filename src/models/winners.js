const mongoose = require("mongoose");

// TODO: Maybe just use userSchema for winners?
const winnerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
});

const Winners = mongoose.model("Winners", winnerSchema);

module.exports = Winners;
