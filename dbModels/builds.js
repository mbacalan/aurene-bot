const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
  build: {
    type: String,
    required: true,
  },
});

const Builds = mongoose.model("Builds", buildSchema);

module.exports = Builds;
