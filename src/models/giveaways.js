const mongoose = require("mongoose");
const userSchema = require("./users");

const giveawaySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  entries: {
    type: [userSchema],
    required: false,
  },
});

module.exports = giveawaySchema;
