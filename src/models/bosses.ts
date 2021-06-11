import { Schema, model } from "mongoose";
import { IBoss } from "../types";

const bossSchema = new Schema<IBoss>({
  name: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  wiki: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  raidIndex: {
    type: String,
    required: true,
  },
});

export const Bosses = model<IBoss>("gw2.bosses", bossSchema);
