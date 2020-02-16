const mongoose = require("mongoose");

const specializationsSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  elite: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: String,
    required: false,
  },
  professionIcon: {
    type: String,
    required: false,
  },
});

const Specializations = mongoose.model("gw2.specializations", specializationsSchema);

module.exports = Specializations;
