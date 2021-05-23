const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
});

module.exports = userSchema;
