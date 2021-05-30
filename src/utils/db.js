const mongoose = require("mongoose");
const logger = require("./logger");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}));

const db = mongoose.connection;

db.on("error", () => logger.error("Error connecting to database"));
db.once("open", () => logger.info("Successfully connected to database"));

module.exports = {
  db,
};
