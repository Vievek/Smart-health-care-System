import mongoose, { Schema } from "mongoose";
import { IWard, WardType } from "@shared/healthcare-types";

const wardSchema = new Schema<IWard>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(WardType), required: true },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Ward = mongoose.model<IWard>("Ward", wardSchema);
