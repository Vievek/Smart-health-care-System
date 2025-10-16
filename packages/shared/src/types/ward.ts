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
