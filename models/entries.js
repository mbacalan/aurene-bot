const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
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
});

const Entries = mongoose.model("Entries", entrySchema);

module.exports = Entries;
