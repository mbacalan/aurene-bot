const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Titles = mongoose.model("gw2.titles", titleSchema);

module.exports = Titles;
