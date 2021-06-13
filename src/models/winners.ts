import { Schema, model } from "mongoose";
import { IWinner } from "../types";

// TODO: Maybe just use userSchema for winners?
const winnerSchema = new Schema<IWinner>({
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
});

export const Winners = model<IWinner>("Winners", winnerSchema);
