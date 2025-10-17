import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Ward } from "../models/Ward.js";
import { Bed } from "../models/Bed.js";
import { InventoryItem } from "../models/Pharmacy.js";
import { MedicalRecord } from "../models/MedicalRecord.js";
import {
  UserRole,
  WardType,
  BedStatus,
  MedicalRecordType,
} from "@shared/healthcare-types";

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Ward.deleteMany({});
    await Bed.deleteMany({});
    await InventoryItem.deleteMany({});
    await MedicalRecord.deleteMany({});

    // Create Users
    const patients = await User.create([
      {
        nationalId: "PAT001",
        email: "patient1@hospital.com",
        phone: "+1234567890",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.PATIENT,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "123 Main St, City",
        dateOfBirth: new Date("1985-05-15"),
        gender: "male",
        emergencyContact: "+1234567891",
        insuranceInfo: "ABC Insurance",
      },
      {
        nationalId: "PAT002",
        email: "patient2@hospital.com",
        phone: "+1234567892",
        firstName: "Jane",
        lastName: "Smith",
        role: UserRole.PATIENT,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "456 Oak St, City",
        dateOfBirth: new Date("1990-08-20"),
        gender: "female",
        emergencyContact: "+1234567893",
        insuranceInfo: "XYZ Insurance",
      },
    ]);

    const doctors = await User.create([
      {
        nationalId: "DOC001",
        email: "dr.smith@hospital.com",
        phone: "+1234567894",
        firstName: "Robert",
        lastName: "Smith",
        role: UserRole.DOCTOR,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "789 Pine St, City",
        specialization: "Cardiology",
        licenseNumber: "MED12345",
      },
      {
        nationalId: "DOC002",
        email: "dr.johnson@hospital.com",
        phone: "+1234567895",
        firstName: "Sarah",
        lastName: "Johnson",
        role: UserRole.DOCTOR,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "321 Elm St, City",
        specialization: "Pediatrics",
        licenseNumber: "MED67890",
      },
    ]);

    const nurses = await User.create([
      {
        nationalId: "NUR001",
        email: "nurse.brown@hospital.com",
        phone: "+1234567896",
        firstName: "Emily",
        lastName: "Brown",
        role: UserRole.NURSE,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "654 Maple St, City",
        wardAssigned: "WARD001",
      },
    ]);

    // Create pharmacist user but don't assign to unused variable
    await User.create([
      {
        nationalId: "PHA001",
        email: "pharmacist.wilson@hospital.com",
        phone: "+1234567897",
        firstName: "Michael",
        lastName: "Wilson",
        role: UserRole.PHARMACIST,
        passwordHash: await bcrypt.hash("password123", 12),
        address: "987 Cedar St, City",
        licenseNumber: "PHA12345",
      },
    ]);

    // Create Wards - Remove the _id fields
    const wards = await Ward.create([
      {
        name: "ICU - Intensive Care Unit",
        type: WardType.ICU,
        capacity: 10,
        currentOccupancy: 2,
      },
      {
        name: "General Ward A",
        type: WardType.GENERAL,
        capacity: 20,
        currentOccupancy: 8,
      },
      {
        name: "Private Ward B",
        type: WardType.PRIVATE,
        capacity: 15,
        currentOccupancy: 5,
      },
    ]);

    console.log(
      "Created wards with IDs:",
      wards.map((w) => w._id)
    );

    // Create Beds - Use the actual generated ward IDs
    const beds = await Bed.create([
      // ICU Beds (wards[0])
      {
        bedNumber: "ICU-01",
        wardId: wards[0]._id!.toString(), // Use the actual generated ID
        bedType: WardType.ICU,
        status: BedStatus.OCCUPIED,
        patientId: patients[0]._id!.toString(),
      },
      {
        bedNumber: "ICU-02",
        wardId: wards[0]._id!.toString(), // Use the actual generated ID
        bedType: WardType.ICU,
        status: BedStatus.AVAILABLE,
      },
      {
        bedNumber: "ICU-03",
        wardId: wards[0]._id!.toString(), // Use the actual generated ID
        bedType: WardType.ICU,
        status: BedStatus.AVAILABLE,
      },

      // General Ward Beds (wards[1])
      {
        bedNumber: "GW-01",
        wardId: wards[1]._id!.toString(), // Use the actual generated ID
        bedType: WardType.GENERAL,
        status: BedStatus.OCCUPIED,
        patientId: patients[1]._id!.toString(),
      },
      {
        bedNumber: "GW-02",
        wardId: wards[1]._id!.toString(), // Use the actual generated ID
        bedType: WardType.GENERAL,
        status: BedStatus.AVAILABLE,
      },
      {
        bedNumber: "GW-03",
        wardId: wards[1]._id!.toString(), // Use the actual generated ID
        bedType: WardType.GENERAL,
        status: BedStatus.AVAILABLE,
      },

      // Private Ward Beds (wards[2])
      {
        bedNumber: "PW-01",
        wardId: wards[2]._id!.toString(), // Use the actual generated ID
        bedType: WardType.PRIVATE,
        status: BedStatus.AVAILABLE,
      },
      {
        bedNumber: "PW-02",
        wardId: wards[2]._id!.toString(), // Use the actual generated ID
        bedType: WardType.PRIVATE,
        status: BedStatus.AVAILABLE,
      },
    ]);

    // Create Inventory Items
    const inventory = await InventoryItem.create([
      {
        name: "Amoxicillin 500mg",
        genericName: "Amoxicillin",
        batchNumber: "BATCH001",
        expiryDate: new Date("2025-12-31"),
        quantityOnHand: 150,
        reorderLevel: 20,
        price: 12.5,
        supplier: "PharmaCorp",
      },
      {
        name: "Ibuprofen 400mg",
        genericName: "Ibuprofen",
        batchNumber: "BATCH002",
        expiryDate: new Date("2025-10-15"),
        quantityOnHand: 200,
        reorderLevel: 30,
        price: 8.75,
        supplier: "MediSupply",
      },
      {
        name: "Metformin 850mg",
        genericName: "Metformin",
        batchNumber: "BATCH003",
        expiryDate: new Date("2025-11-20"),
        quantityOnHand: 5, // Low stock
        reorderLevel: 25,
        price: 15.25,
        supplier: "DrugCo",
      },
    ]);

    // Create Medical Records
    const medicalRecords = await MedicalRecord.create([
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Cardiology Prescription",
        description: "Follow-up prescription for heart condition",
        authorId: doctors[0]._id!.toString(),
        prescription: {
          medications: [
            {
              medicationId: inventory[0]._id!.toString(),
              name: "Amoxicillin 500mg",
              dosage: "1 tablet",
              frequency: "3 times daily",
              duration: "7 days",
              instructions: "Take with food",
            },
          ],
          instructions: "Complete full course of antibiotics",
          issuedDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: "active",
        },
      },
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.LAB,
        title: "Blood Test Results",
        description: "Routine blood work",
        authorId: doctors[0]._id!.toString(),
        labResults: {
          testName: "Complete Blood Count",
          results: {
            wbc: 7.2,
            rbc: 4.8,
            hemoglobin: 14.2,
            platelets: 250,
          },
          normalRange: {
            wbc: "4.5-11.0",
            rbc: "4.5-6.0",
            hemoglobin: "13.5-17.5",
            platelets: "150-450",
          },
          units: {
            wbc: "10^3/μL",
            rbc: "10^6/μL",
            hemoglobin: "g/dL",
            platelets: "10^3/μL",
          },
        },
      },
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Pain Management",
        description: "Prescription for pain relief",
        authorId: doctors[1]._id!.toString(),
        prescription: {
          medications: [
            {
              medicationId: inventory[1]._id!.toString(),
              name: "Ibuprofen 400mg",
              dosage: "1 tablet",
              frequency: "As needed",
              duration: "10 days",
              instructions: "Take with food",
            },
          ],
          instructions: "Do not exceed 1200mg per day",
          issuedDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
        },
      },
    ]);

    console.log("Database seeded successfully!");
    console.log(
      `Created: ${patients.length} patients, ${doctors.length} doctors, ${nurses.length} nurses`
    );
    console.log(
      `Created: ${wards.length} wards, ${beds.length} beds, ${inventory.length} inventory items`
    );
    console.log(`Created: ${medicalRecords.length} medical records`);

    // Log the actual ward IDs for reference
    console.log(
      "Ward IDs:",
      wards.map((w) => ({ name: w.name, id: w._id }))
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
