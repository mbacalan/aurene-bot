const mongoose = require("mongoose");

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

module.exports = mongoose.model("Bosses", bossSchema);

