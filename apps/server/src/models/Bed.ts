import mongoose, { Schema } from "mongoose";
import { IBed, WardType, BedStatus } from "@shared/healthcare-types";

const bedSchema = new Schema<IBed>(
  {
    bedNumber: { type: String, required: true },
    wardId: {
      type: String,
      required: true,
    },
    bedType: {
      type: String,
      enum: Object.values(WardType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BedStatus),
      default: BedStatus.AVAILABLE,
    },
    patientId: {
      type: String,
    },
    features: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

bedSchema.index({ wardId: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ patientId: 1 });
bedSchema.index({ status: 1 });

export const Bed = mongoose.model<IBed>("Bed", bedSchema);
