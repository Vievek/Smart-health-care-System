import { vi } from "vitest";
import {
  UserRole,
  AppointmentStatus,
  WardType,
  BedStatus,
  MedicalRecordType,
} from "@shared/healthcare-types";

export const createMockService = (methods: Record<string, any>) => {
  return vi.fn(() => methods);
};

// Enhanced mock data with proper doctor names and matching IDs
export const mockAppointments = [
  {
    _id: "appt1",
    patientId: "user123",
    doctorId: "doc123", // This matches the doctor ID below
    dateTime: new Date("2024-12-25T10:00:00Z"),
    duration: 30,
    status: AppointmentStatus.CONFIRMED,
    reason: "Regular checkup",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockMedicalRecords = [
  {
    _id: "record1",
    patientId: "user123",
    recordType: MedicalRecordType.LAB,
    title: "Blood Test Results",
    description: "Complete blood count test",
    createdDate: new Date("2024-01-15"),
    authorId: "doc123",
    attachments: [],
  },
];

export const mockInventory = [
  {
    _id: "inv1",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    batchNumber: "BATCH001",
    expiryDate: new Date("2025-12-31"),
    quantityOnHand: 150,
    reorderLevel: 20,
    price: 12.5,
    supplier: "PharmaCorp",
  },
];

export const mockWards = [
  {
    _id: "ward1",
    name: "ICU - Intensive Care Unit",
    type: WardType.ICU,
    capacity: 10,
    currentOccupancy: 2,
  },
];

export const mockBeds = [
  {
    _id: "bed1",
    bedNumber: "ICU-01",
    wardId: "ward1",
    bedType: WardType.ICU,
    status: BedStatus.AVAILABLE,
    features: ["Ventilator", "Monitor"],
  },
];

export const mockUsers = [
  {
    _id: "user123",
    nationalId: "PAT001",
    email: "patient@test.com",
    phone: "+1234567890",
    firstName: "John",
    lastName: "Doe",
    role: UserRole.PATIENT,
    status: "active",
    passwordHash: "hashed",
    address: "123 Test St",
  },
  {
    _id: "doc123", // This ID matches the doctorId in mockAppointments
    nationalId: "DOC001",
    email: "doctor@test.com",
    phone: "+1234567891",
    firstName: "Robert",
    lastName: "Smith", // This should now appear in the UI
    role: UserRole.DOCTOR,
    status: "active",
    passwordHash: "hashed",
    address: "456 Test St",
    specialization: "Cardiology",
  },
  {
    _id: "nurse123",
    nationalId: "NUR001",
    email: "nurse@test.com",
    phone: "+1234567892",
    firstName: "Emily",
    lastName: "Brown",
    role: UserRole.NURSE,
    status: "active",
    passwordHash: "hashed",
    address: "789 Test St",
  },
  {
    _id: "pharm123",
    nationalId: "PHA001",
    email: "pharmacist@test.com",
    phone: "+1234567893",
    firstName: "Michael",
    lastName: "Wilson",
    role: UserRole.PHARMACIST,
    status: "active",
    passwordHash: "hashed",
    address: "321 Test St",
  },
];
