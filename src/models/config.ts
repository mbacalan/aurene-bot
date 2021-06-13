import { Schema } from "mongoose";
import { IConfig } from '../types';

const configSchema = new Schema<IConfig>({
  prefix: {
    type: String,
    required: true,
    default: ">",
  },
  leaders: {
    type: Number,
    required: false,
  },
  officers: {
    type: Number,
    required: false,
  },
  giveawayChannel: {
    type: Number,
    required: false,
  },
  missionsChannel: {
    type: Number,
    required: false,
  },
  starboardChannel: {
    type: Number,
    required: false,
  },
  giveawayRole: {
    type: Number,
    required: false,
  },
});

export = configSchema;
