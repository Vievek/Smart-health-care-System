import mongoose, { Schema } from "mongoose";
import { IAppointment, AppointmentStatus } from "@shared/healthcare-types";

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    dateTime: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    reason: { type: String, required: true },
    notes: String,
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctorId: 1, dateTime: 1 });
appointmentSchema.index({ patientId: 1, dateTime: 1 });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
