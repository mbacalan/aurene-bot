import { Schema, model } from "mongoose";
import { ISpecialization } from '../types';

const specializationsSchema = new Schema<ISpecialization>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  elite: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: String,
    required: false,
  },
  professionIcon: {
    type: String,
    required: false,
  },
});

export const Specializations = model<ISpecialization>("gw2.specializations", specializationsSchema);
