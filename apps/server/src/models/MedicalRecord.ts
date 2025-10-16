import mongoose, { Schema } from "mongoose";
import {
  IMedicalRecord,
  MedicalRecordType,
  PrescriptionStatus,
} from "@shared/healthcare-types";

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: String,
      required: true,
    },
    recordType: {
      type: String,
      enum: Object.values(MedicalRecordType),
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    createdDate: { type: Date, default: Date.now },
    authorId: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    visitDetails: {
      symptoms: [String],
      diagnosis: String,
      notes: String,
      vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        oxygenSaturation: Number,
      },
    },
    labResults: {
      testName: String,
      results: Schema.Types.Mixed,
      normalRange: Schema.Types.Mixed,
      units: Schema.Types.Mixed,
    },
    prescription: {
      medications: [
        {
          medicationId: String,
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
          instructions: String,
        },
      ],
      instructions: String,
      issuedDate: { type: Date, default: Date.now },
      expiryDate: Date,
      status: {
        type: String,
        enum: Object.values(PrescriptionStatus),
        default: PrescriptionStatus.ACTIVE,
      },
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({ patientId: 1, createdDate: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>(
  "MedicalRecord",
  medicalRecordSchema
);
