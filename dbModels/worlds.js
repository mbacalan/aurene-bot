const mongoose = require("mongoose");

const worldSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  population: {
    type: String,
    required: false,
  },
});

const Worlds = mongoose.model("gw2.worlds", worldSchema);

module.exports = Worlds;
