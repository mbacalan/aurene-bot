import { Schema, model } from "mongoose";
import { ITitle } from '../types';

const titleSchema = new Schema<ITitle>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const Titles = model<ITitle>("gw2.titles", titleSchema);
