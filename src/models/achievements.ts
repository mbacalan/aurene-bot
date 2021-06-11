import { Schema, model } from 'mongoose';
import { IAchievement } from '../types';

const achievementsSchema = new Schema<IAchievement>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

export const Achievements = model<IAchievement>("gw2.achievements", achievementsSchema);
