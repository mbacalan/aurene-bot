import { Schema } from "mongoose";
import { IConfig } from '../types';

// TODO: Ranks might be required
const configSchema = new Schema<IConfig>({
  leaders: {
    type: Number,
    required: false,
  },
  officers: {
    type: Number,
    required: false,
  },
  giveawayChannel: {
    type: String,
    required: false,
  },
  missionsChannel: {
    type: String,
    required: false,
  },
  starboardChannel: {
    type: String,
    required: false,
  },
  giveawayRole: {
    type: Number,
    required: false,
  },
});

export = configSchema;
