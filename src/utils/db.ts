import { connect, connection } from "mongoose";
import { logger } from "./";

connect(process.env.MONGO_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}));

export const db = connection;

db.on("error", () => logger.error("Error connecting to database"));
db.once("open", () => logger.info("Successfully connected to database"));
