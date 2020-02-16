const mongoose = require("mongoose");

const achievementsSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

const Achievements = mongoose.model("gw2.achievements", achievementsSchema);

module.exports = Achievements;
