import mongoose, { Schema } from "mongoose";
import {
  IUser,
  UserRole,
  UserStatus,
  IPatient,
  IDoctor,
  INurse,
  IPharmacist,
  IAdministrator,
  IJudicialMember,
  IWardClerk,
} from "@shared/healthcare-types";

const userSchema = new Schema<IUser>(
  {
    nationalId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    passwordHash: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

export const User = mongoose.model<IUser>("User", userSchema);

export const Patient = User.discriminator<IPatient>(
  "Patient",
  new Schema({
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    emergencyContact: { type: String, required: true },
    insuranceInfo: String,
    dependents: [String],
  })
);

export const Doctor = User.discriminator<IDoctor>(
  "Doctor",
  new Schema({
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    schedule: [
      {
        dayOfWeek: Number,
        startTime: String,
        endTime: String,
        isAvailable: Boolean,
      },
    ],
  })
);

export const Nurse = User.discriminator<INurse>(
  "Nurse",
  new Schema({
    wardAssigned: { type: String, required: true },
  })
);

export const WardClerk = User.discriminator<IWardClerk>(
  "WardClerk",
  new Schema({
    department: { type: String, required: true },
  })
);

export const Pharmacist = User.discriminator<IPharmacist>(
  "Pharmacist",
  new Schema({
    licenseNumber: { type: String, required: true, unique: true },
  })
);

export const Administrator = User.discriminator<IAdministrator>(
  "Administrator",
  new Schema({
    permissions: [{ type: String }],
  })
);

export const JudicialMember = User.discriminator<IJudicialMember>(
  "JudicialMember",
  new Schema({
    legalDocumentReference: { type: String, required: true },
    accessExpiry: { type: Date, required: true },
    approvedBy: String,
  })
);
