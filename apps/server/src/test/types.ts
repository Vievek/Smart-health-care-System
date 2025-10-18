// Local copy of shared types for testing
export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  RESCHEDULED = "rescheduled",
}

export interface IAppointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export enum WardType {
  ICU = "icu",
  GENERAL = "general",
  PRIVATE = "private",
  EMERGENCY = "emergency",
}

export enum BedStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  MAINTENANCE = "maintenance",
}

export interface IWard {
  _id?: string;
  name: string;
  type: WardType;
  capacity: number;
  currentOccupancy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBed {
  _id?: string;
  bedNumber: string;
  wardId: string;
  bedType: WardType;
  status: BedStatus;
  patientId?: string;
  features: string[];
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  INSURANCE = "insurance",
}

export interface IInventoryItem {
  _id?: string;
  name: string;
  genericName: string;
  batchNumber: string;
  expiryDate: Date;
  quantityOnHand: number;
  reorderLevel: number;
  price: number;
  supplier: string;
}

export interface IDispenseTransaction {
  _id?: string;
  prescriptionId: string;
  patientId: string;
  pharmacistId: string;
  medications: IDispensedMedication[];
  dispensedAt: Date;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amount?: number;
}

export interface IDispensedMedication {
  medicationId: string;
  quantity: number;
  batchNumber: string;
  price: number;
}

export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  NURSE = "nurse",
  PHARMACIST = "pharmacist",
  ADMIN = "admin",
  WARD_CLERK = "ward_clerk",
  JUDICIAL = "judicial",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export interface IUser {
  _id?: string;
  nationalId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatient extends IUser {
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  emergencyContact: string;
  insuranceInfo?: string;
  dependents: string[];
}

export interface IDoctor extends IUser {
  specialization: string;
  licenseNumber: string;
  schedule: IWorkSchedule[];
}

export interface IWorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IAuditLog {
  _id?: string;
  actorId: string;
  action: string;
  targetId: string;
  targetType: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: "success" | "failure";
}
