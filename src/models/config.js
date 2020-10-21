const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  prefix: {
    type: String,
    required: true,
  },
});

const Config = mongoose.model("config", configSchema);

module.exports = Config;
