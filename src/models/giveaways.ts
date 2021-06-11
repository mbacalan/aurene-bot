import { Schema } from "mongoose";
import userSchema from "./users";
import { IGiveaway } from '../types';

const giveawaySchema = new Schema<IGiveaway>({
  _id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  entries: {
    type: [userSchema],
    required: false,
  },
});

export = giveawaySchema;
