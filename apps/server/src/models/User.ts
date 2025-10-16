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

// Base User Schema
const userSchema = new Schema<IUser>(
  {
    nationalId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
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

// Create the base User model
export const User = mongoose.model<IUser>("User", userSchema);

// Patient Schema
const patientSchema = new Schema<IPatient>({
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  emergencyContact: { type: String, required: true },
  insuranceInfo: String,
  dependents: [{ type: String }],
});

// Doctor Schema
const doctorSchema = new Schema<IDoctor>({
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
});

// Nurse Schema
const nurseSchema = new Schema<INurse>({
  wardAssigned: { type: String, required: true },
});

// Ward Clerk Schema
const wardClerkSchema = new Schema<IWardClerk>({
  department: { type: String, required: true },
});

// Pharmacist Schema
const pharmacistSchema = new Schema<IPharmacist>({
  licenseNumber: { type: String, required: true, unique: true },
});

// Administrator Schema
const administratorSchema = new Schema<IAdministrator>({
  permissions: [{ type: String }],
});

// Judicial Member Schema
const judicialMemberSchema = new Schema<IJudicialMember>({
  legalDocumentReference: { type: String, required: true },
  accessExpiry: { type: Date, required: true },
  approvedBy: String,
});

// Create discriminators for each role
export const Patient = User.discriminator<IPatient>(
  UserRole.PATIENT,
  patientSchema
);

export const Doctor = User.discriminator<IDoctor>(
  UserRole.DOCTOR,
  doctorSchema
);

export const Nurse = User.discriminator<INurse>(UserRole.NURSE, nurseSchema);

export const WardClerk = User.discriminator<IWardClerk>(
  UserRole.WARD_CLERK,
  wardClerkSchema
);

export const Pharmacist = User.discriminator<IPharmacist>(
  UserRole.PHARMACIST,
  pharmacistSchema
);

export const Administrator = User.discriminator<IAdministrator>(
  UserRole.ADMIN,
  administratorSchema
);

export const JudicialMember = User.discriminator<IJudicialMember>(
  UserRole.JUDICIAL,
  judicialMemberSchema
);
