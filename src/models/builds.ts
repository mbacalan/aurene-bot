import { Schema, model } from "mongoose";
import { IBuild } from '../types';

const buildSchema = new Schema<IBuild>({
  build: {
    type: String,
    required: true,
    index: true,
  },
});

export const Builds = model<IBuild>("gw2.builds", buildSchema);
