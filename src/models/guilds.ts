import { Schema, model } from 'mongoose';
import configSchema from "./config";
import giveawaySchema from "./giveaways";
import { IGuild } from '../types';

const guildSchema = new Schema<IGuild>({
  _id: {
    type: String,
    required: true,
  },
  config: {
    type: configSchema,
    default: () => ({}),
  },
  giveaways: {
    type: [giveawaySchema],
    required: false,
  },
  giveawayWinners: [{ type: Schema.Types.ObjectId, ref: "Winners" }],
});

export const Guilds = model<IGuild>("guild", guildSchema);
