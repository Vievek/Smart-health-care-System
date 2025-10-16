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
