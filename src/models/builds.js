const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
  build: {
    type: String,
    required: true,
    index: true,
  },
});

const Builds = mongoose.model("gw2.builds", buildSchema);

module.exports = Builds;
