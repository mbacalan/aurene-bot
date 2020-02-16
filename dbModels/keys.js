const mongoose = require("mongoose");

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

const Keys = mongoose.model("Keys", keySchema);

module.exports = Keys;
