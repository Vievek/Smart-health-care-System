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

export interface INurse extends IUser {
  wardAssigned: string;
}

export interface IWardClerk extends IUser {
  department: string;
}

export interface IPharmacist extends IUser {
  licenseNumber: string;
}

export interface IAdministrator extends IUser {
  permissions: string[];
}

export interface IJudicialMember extends IUser {
  legalDocumentReference: string;
  accessExpiry: Date;
  approvedBy: string;
}

export interface IWorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Export User type alias
export type User = IUser;
