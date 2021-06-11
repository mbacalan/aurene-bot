import { Schema, model } from "mongoose";
import { IWorld } from "../types";

const worldSchema = new Schema<IWorld>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  population: {
    type: String,
    required: false,
  },
});

export const Worlds = model<IWorld>("gw2.worlds", worldSchema);
