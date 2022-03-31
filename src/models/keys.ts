import { Schema, model } from "mongoose";
import { IKey } from '../types';

const keySchema = new Schema<IKey>({
  discordId: {
    type: String,
    required: true,
  },
  keyName: {
    type: String,
    required: false,
  },
  accountName: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
});

export const Keys = model<IKey>("Keys", keySchema);
