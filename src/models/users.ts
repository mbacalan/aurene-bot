import { Schema } from "mongoose";
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
  },
  userTag: {
    type: String,
    required: true,
  },
});

export = userSchema;
