import { createLogger, format, transports, add } from "winston";
import "winston-mongodb";

/*
  {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  }
*/

const logTransports = {
  console: new transports.Console(
    {
      level: "verbose",
      format: format.combine(format.colorize(), format.simple()),
    },
  ),
  mongodb: new transports.MongoDB(
    {
      db: process.env.MONGO_URI || "mongodb://mongodb:27017/local",
      options: { useUnifiedTopology: true, useNewUrlParser: true },
      level: "info",
    },
  ),
};

export const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ["message", "level"] }),
    format.splat(),
    format.json(),
  ),
  transports: [
    logTransports.mongodb,
    logTransports.console,
  ],
});

// Log to console if not in production
if (process.env.NODE_ENV !== "production") {
  const mongoTransport = logger.transports.find(transport => {
    return transport.name === "mongodb";
  });

  logger.remove(mongoTransport);
}

add(logger);
