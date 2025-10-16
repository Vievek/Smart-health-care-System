import mongoose, { Schema } from "mongoose";
import {
  IInventoryItem,
  IDispenseTransaction,
  PaymentStatus,
  PaymentMethod,
} from "@shared/healthcare-types";

const inventoryItemSchema = new Schema<IInventoryItem>({
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantityOnHand: { type: Number, required: true },
  reorderLevel: { type: Number, required: true },
  price: { type: Number, required: true },
  supplier: { type: String, required: true },
});

const dispenseTransactionSchema = new Schema<IDispenseTransaction>({
  prescriptionId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  pharmacistId: {
    type: String,
    required: true,
  },
  medications: [
    {
      medicationId: String,
      quantity: { type: Number, required: true },
      batchNumber: String,
      price: Number,
    },
  ],
  dispensedAt: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
  },
  amount: Number,
});

export const InventoryItem = mongoose.model<IInventoryItem>(
  "InventoryItem",
  inventoryItemSchema
);
export const DispenseTransaction = mongoose.model<IDispenseTransaction>(
  "DispenseTransaction",
  dispenseTransactionSchema
);
