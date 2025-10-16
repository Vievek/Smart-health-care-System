export enum MedicalRecordType {
  LAB = "lab",
  IMAGING = "imaging",
  PRESCRIPTION = "prescription",
  VISIT_NOTE = "visit_note",
  ADMISSION = "admission",
}

export enum PrescriptionStatus {
  ACTIVE = "active",
  DISPENSED = "dispensed",
  PARTIALLY_DISPENSED = "partially_dispensed",
  EXPIRED = "expired",
}

export interface IMedicalRecord {
  _id?: string;
  patientId: string;
  recordType: MedicalRecordType;
  title: string;
  description?: string;
  createdDate: Date;
  authorId: string;
  attachments: IAttachment[];
  visitDetails?: IVisitDetails;
  labResults?: ILabResults;
  prescription?: IPrescription;
}

export interface IAttachment {
  filename: string;
  url: string;
  fileType: string;
  uploadedAt: Date;
}

export interface IVisitDetails {
  symptoms: string[];
  diagnosis: string;
  notes: string;
  vitalSigns: IVitalSigns;
}

export interface IVitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
}

export interface ILabResults {
  testName: string;
  results: Record<string, any>;
  normalRange: Record<string, any>;
  units: Record<string, string>;
}

export interface IPrescription {
  medications: IMedication[];
  instructions: string;
  issuedDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
}

export interface IMedication {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
