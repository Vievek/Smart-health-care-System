import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Doctor } from "../models/User.js";
import { Ward } from "../models/Ward.js";
import { Bed } from "../models/Bed.js";
import { InventoryItem } from "../models/Pharmacy.js";
import { MedicalRecord } from "../models/MedicalRecord.js";
import {
  UserRole,
  WardType,
  BedStatus,
  MedicalRecordType,
  PrescriptionStatus,
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

    console.log("Cleared existing data");

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

    console.log("Created patients:", patients.length);

    const doctors = await Doctor.create([
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

    console.log("Created doctors:", doctors.length);

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

    console.log("Created nurses:", nurses.length);

    const pharmacists = await User.create([
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

    console.log("Created pharmacists:", pharmacists.length);

    // Create Wards
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
      {
        name: "Emergency Ward",
        type: WardType.EMERGENCY,
        capacity: 25,
        currentOccupancy: 12,
      },
    ]);

    console.log("Created wards:", wards.length);

    // Create Beds - Use the actual generated ward IDs
    const beds = await Bed.create([
      // ICU Beds (wards[0])
      {
        bedNumber: "ICU-01",
        wardId: wards[0]._id!.toString(),
        bedType: WardType.ICU,
        status: BedStatus.OCCUPIED,
        patientId: patients[0]._id!.toString(),
        features: ["Ventilator", "Monitor", "Oxygen"],
      },
      {
        bedNumber: "ICU-02",
        wardId: wards[0]._id!.toString(),
        bedType: WardType.ICU,
        status: BedStatus.AVAILABLE,
        features: ["Ventilator", "Monitor", "Oxygen"],
      },
      {
        bedNumber: "ICU-03",
        wardId: wards[0]._id!.toString(),
        bedType: WardType.ICU,
        status: BedStatus.AVAILABLE,
        features: ["Monitor", "Oxygen"],
      },
      {
        bedNumber: "ICU-04",
        wardId: wards[0]._id!.toString(),
        bedType: WardType.ICU,
        status: BedStatus.MAINTENANCE,
        features: ["Ventilator", "Monitor"],
      },

      // General Ward Beds (wards[1])
      {
        bedNumber: "GW-01",
        wardId: wards[1]._id!.toString(),
        bedType: WardType.GENERAL,
        status: BedStatus.OCCUPIED,
        patientId: patients[1]._id!.toString(),
        features: ["Side Table", "Curtain"],
      },
      {
        bedNumber: "GW-02",
        wardId: wards[1]._id!.toString(),
        bedType: WardType.GENERAL,
        status: BedStatus.AVAILABLE,
        features: ["Side Table", "Curtain"],
      },
      {
        bedNumber: "GW-03",
        wardId: wards[1]._id!.toString(),
        bedType: WardType.GENERAL,
        status: BedStatus.AVAILABLE,
        features: ["Side Table"],
      },
      {
        bedNumber: "GW-04",
        wardId: wards[1]._id!.toString(),
        bedType: WardType.GENERAL,
        status: BedStatus.AVAILABLE,
        features: ["Side Table", "Curtain"],
      },
      {
        bedNumber: "GW-05",
        wardId: wards[1]._id!.toString(),
        bedType: WardType.GENERAL,
        status: BedStatus.OCCUPIED,
        features: ["Side Table"],
      },

      // Private Ward Beds (wards[2])
      {
        bedNumber: "PW-01",
        wardId: wards[2]._id!.toString(),
        bedType: WardType.PRIVATE,
        status: BedStatus.AVAILABLE,
        features: ["TV", "Private Bathroom", "Sofa", "WiFi"],
      },
      {
        bedNumber: "PW-02",
        wardId: wards[2]._id!.toString(),
        bedType: WardType.PRIVATE,
        status: BedStatus.AVAILABLE,
        features: ["TV", "Private Bathroom", "WiFi"],
      },
      {
        bedNumber: "PW-03",
        wardId: wards[2]._id!.toString(),
        bedType: WardType.PRIVATE,
        status: BedStatus.OCCUPIED,
        features: ["TV", "Private Bathroom", "Sofa", "WiFi", "Mini Fridge"],
      },
      {
        bedNumber: "PW-04",
        wardId: wards[2]._id!.toString(),
        bedType: WardType.PRIVATE,
        status: BedStatus.AVAILABLE,
        features: ["TV", "Private Bathroom", "WiFi"],
      },

      // Emergency Ward Beds (wards[3])
      {
        bedNumber: "ER-01",
        wardId: wards[3]._id!.toString(),
        bedType: WardType.EMERGENCY,
        status: BedStatus.OCCUPIED,
        features: ["Monitor", "Oxygen", "Emergency Kit"],
      },
      {
        bedNumber: "ER-02",
        wardId: wards[3]._id!.toString(),
        bedType: WardType.EMERGENCY,
        status: BedStatus.OCCUPIED,
        features: ["Monitor", "Oxygen"],
      },
      {
        bedNumber: "ER-03",
        wardId: wards[3]._id!.toString(),
        bedType: WardType.EMERGENCY,
        status: BedStatus.AVAILABLE,
        features: ["Monitor", "Emergency Kit"],
      },
      {
        bedNumber: "ER-04",
        wardId: wards[3]._id!.toString(),
        bedType: WardType.EMERGENCY,
        status: BedStatus.AVAILABLE,
        features: ["Monitor", "Oxygen"],
      },
      {
        bedNumber: "ER-05",
        wardId: wards[3]._id!.toString(),
        bedType: WardType.EMERGENCY,
        status: BedStatus.MAINTENANCE,
        features: ["Monitor"],
      },
    ]);

    console.log("Created beds:", beds.length);

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
      {
        name: "Lisinopril 10mg",
        genericName: "Lisinopril",
        batchNumber: "BATCH004",
        expiryDate: new Date("2025-09-30"),
        quantityOnHand: 80,
        reorderLevel: 15,
        price: 18.5,
        supplier: "HeartMed Inc",
      },
      {
        name: "Atorvastatin 20mg",
        genericName: "Atorvastatin",
        batchNumber: "BATCH005",
        expiryDate: new Date("2025-11-15"),
        quantityOnHand: 120,
        reorderLevel: 25,
        price: 22.75,
        supplier: "Cholesterol Care",
      },
      {
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        batchNumber: "BATCH006",
        expiryDate: new Date("2025-08-20"),
        quantityOnHand: 90,
        reorderLevel: 20,
        price: 14.25,
        supplier: "GastroHealth",
      },
      {
        name: "Metoprolol 50mg",
        genericName: "Metoprolol",
        batchNumber: "BATCH007",
        expiryDate: new Date("2025-12-10"),
        quantityOnHand: 110,
        reorderLevel: 25,
        price: 16.8,
        supplier: "CardioCare",
      },
      {
        name: "Levothyroxine 50mcg",
        genericName: "Levothyroxine",
        batchNumber: "BATCH008",
        expiryDate: new Date("2025-10-25"),
        quantityOnHand: 75,
        reorderLevel: 15,
        price: 19.3,
        supplier: "Thyroid Solutions",
      },
    ]);

    console.log("Created inventory items:", inventory.length);

    // Create Medical Records with Prescriptions
    const medicalRecords = await MedicalRecord.create([
      // Patient 1 - John Doe (Multiple prescriptions)
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Cardiology Prescription - Heart Medication",
        description:
          "Follow-up prescription for hypertension and cholesterol management",
        authorId: doctors[0]._id!.toString(),
        createdDate: new Date("2024-01-15"),
        prescription: {
          medications: [
            {
              medicationId: inventory[3]._id!.toString(), // Lisinopril
              name: "Lisinopril 10mg",
              dosage: "1 tablet",
              frequency: "Once daily",
              duration: "30 days",
              instructions: "Take in the morning with water",
            },
            {
              medicationId: inventory[4]._id!.toString(), // Atorvastatin
              name: "Atorvastatin 20mg",
              dosage: "1 tablet",
              frequency: "Once daily at bedtime",
              duration: "30 days",
              instructions: "Take at bedtime",
            },
            {
              medicationId: inventory[6]._id!.toString(), // Metoprolol
              name: "Metoprolol 50mg",
              dosage: "1/2 tablet",
              frequency: "Twice daily",
              duration: "30 days",
              instructions: "Take with food",
            },
          ],
          instructions:
            "Monitor blood pressure weekly. Follow up in 30 days. Report any dizziness or swelling.",
          issuedDate: new Date("2024-01-15"),
          expiryDate: new Date("2024-02-15"),
          status: PrescriptionStatus.ACTIVE,
        },
      },
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Antibiotic Course - Respiratory Infection",
        description: "7-day antibiotic course for respiratory infection",
        authorId: doctors[0]._id!.toString(),
        createdDate: new Date("2024-01-10"),
        prescription: {
          medications: [
            {
              medicationId: inventory[0]._id!.toString(), // Amoxicillin
              name: "Amoxicillin 500mg",
              dosage: "1 tablet",
              frequency: "3 times daily",
              duration: "7 days",
              instructions: "Take with food to avoid stomach upset",
            },
          ],
          instructions:
            "Complete full course even if symptoms improve. Avoid alcohol. Drink plenty of water.",
          issuedDate: new Date("2024-01-10"),
          expiryDate: new Date("2024-02-10"),
          status: PrescriptionStatus.ACTIVE,
        },
      },
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Acid Reflux Treatment",
        description: "Medication for gastroesophageal reflux disease",
        authorId: doctors[0]._id!.toString(),
        createdDate: new Date("2024-01-05"),
        prescription: {
          medications: [
            {
              medicationId: inventory[5]._id!.toString(), // Omeprazole
              name: "Omeprazole 20mg",
              dosage: "1 capsule",
              frequency: "Once daily before breakfast",
              duration: "14 days",
              instructions: "Take 30 minutes before food",
            },
          ],
          instructions:
            "Avoid spicy and acidic foods. Take medication on empty stomach.",
          issuedDate: new Date("2024-01-05"),
          expiryDate: new Date("2024-01-20"),
          status: PrescriptionStatus.ACTIVE,
        },
      },

      // Patient 2 - Jane Smith (Multiple prescriptions)
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Pain Management - Back Pain",
        description: "Pain relief medication for chronic back pain",
        authorId: doctors[1]._id!.toString(),
        createdDate: new Date("2024-01-12"),
        prescription: {
          medications: [
            {
              medicationId: inventory[1]._id!.toString(), // Ibuprofen
              name: "Ibuprofen 400mg",
              dosage: "1 tablet",
              frequency: "Every 6 hours as needed",
              duration: "10 days",
              instructions: "Take with food or milk",
            },
          ],
          instructions:
            "Do not exceed 1200mg per day. Discontinue if stomach pain occurs. Use heat therapy along with medication.",
          issuedDate: new Date("2024-01-12"),
          expiryDate: new Date("2024-01-22"),
          status: PrescriptionStatus.ACTIVE,
        },
      },
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Diabetes Management - Metformin",
        description: "Ongoing diabetes medication management",
        authorId: doctors[1]._id!.toString(),
        createdDate: new Date("2024-01-01"),
        prescription: {
          medications: [
            {
              medicationId: inventory[2]._id!.toString(), // Metformin
              name: "Metformin 850mg",
              dosage: "1 tablet",
              frequency: "Twice daily with meals",
              duration: "90 days",
              instructions: "Take with morning and evening meals",
            },
          ],
          instructions:
            "Monitor blood sugar levels regularly. Report any unusual symptoms. Maintain diet and exercise routine.",
          issuedDate: new Date("2024-01-01"),
          expiryDate: new Date("2024-03-31"),
          status: PrescriptionStatus.ACTIVE,
        },
      },
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Thyroid Medication - Levothyroxine",
        description: "Thyroid hormone replacement therapy",
        authorId: doctors[1]._id!.toString(),
        createdDate: new Date("2024-01-08"),
        prescription: {
          medications: [
            {
              medicationId: inventory[7]._id!.toString(), // Levothyroxine
              name: "Levothyroxine 50mcg",
              dosage: "1 tablet",
              frequency: "Once daily on empty stomach",
              duration: "30 days",
              instructions: "Take 30-60 minutes before breakfast",
            },
          ],
          instructions:
            "Take on empty stomach. Avoid calcium and iron supplements within 4 hours. Regular blood tests required.",
          issuedDate: new Date("2024-01-08"),
          expiryDate: new Date("2024-02-08"),
          status: PrescriptionStatus.ACTIVE,
        },
      },

      // Lab Results
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.LAB,
        title: "Blood Test Results - Comprehensive Panel",
        description: "Routine blood work and lipid panel",
        authorId: doctors[0]._id!.toString(),
        createdDate: new Date("2024-01-14"),
        labResults: {
          testName: "Complete Blood Count & Lipid Panel",
          results: {
            wbc: 7.2,
            rbc: 4.8,
            hemoglobin: 14.2,
            platelets: 250,
            cholesterol: 185,
            triglycerides: 120,
            hdl: 45,
            ldl: 110,
            glucose: 95,
          },
          normalRange: {
            wbc: "4.5-11.0",
            rbc: "4.5-6.0",
            hemoglobin: "13.5-17.5",
            platelets: "150-450",
            cholesterol: "<200",
            triglycerides: "<150",
            hdl: ">40",
            ldl: "<100",
            glucose: "70-100",
          },
          units: {
            wbc: "10^3/μL",
            rbc: "10^6/μL",
            hemoglobin: "g/dL",
            platelets: "10^3/μL",
            cholesterol: "mg/dL",
            triglycerides: "mg/dL",
            hdl: "mg/dL",
            ldl: "mg/dL",
            glucose: "mg/dL",
          },
        },
      },
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.LAB,
        title: "Blood Glucose and Thyroid Tests",
        description:
          "Fasting and post-prandial blood sugar levels with thyroid function",
        authorId: doctors[1]._id!.toString(),
        createdDate: new Date("2024-01-13"),
        labResults: {
          testName: "Blood Glucose Levels & Thyroid Panel",
          results: {
            fasting: 95,
            postPrandial: 135,
            hba1c: 6.2,
            tsh: 2.1,
            t4: 8.2,
            t3: 120,
          },
          normalRange: {
            fasting: "70-100",
            postPrandial: "<140",
            hba1c: "<5.7",
            tsh: "0.4-4.0",
            t4: "4.5-12.0",
            t3: "80-200",
          },
          units: {
            fasting: "mg/dL",
            postPrandial: "mg/dL",
            hba1c: "%",
            tsh: "mIU/L",
            t4: "μg/dL",
            t3: "ng/dL",
          },
        },
      },

      // Visit Notes
      {
        patientId: patients[0]._id!.toString(),
        recordType: MedicalRecordType.VISIT_NOTE,
        title: "Cardiology Follow-up Visit",
        description: "Regular cardiology check-up and medication review",
        authorId: doctors[0]._id!.toString(),
        createdDate: new Date("2024-01-15"),
        visitDetails: {
          symptoms: ["Mild chest discomfort", "Occasional dizziness"],
          diagnosis: "Stable hypertension, well-controlled cholesterol",
          notes:
            "Patient responding well to current medication regimen. Blood pressure well controlled. Continue current treatment.",
          vitalSigns: {
            bloodPressure: "125/80",
            heartRate: 72,
            temperature: 98.6,
            oxygenSaturation: 98,
          },
        },
      },
      {
        patientId: patients[1]._id!.toString(),
        recordType: MedicalRecordType.VISIT_NOTE,
        title: "Diabetes Management Visit",
        description: "Quarterly diabetes management and medication adjustment",
        authorId: doctors[1]._id!.toString(),
        createdDate: new Date("2024-01-12"),
        visitDetails: {
          symptoms: ["Increased thirst", "Fatigue"],
          diagnosis: "Type 2 Diabetes, well-controlled with medication",
          notes:
            "Blood sugar levels improving with current metformin dosage. Patient educated about diet and exercise. Continue current regimen.",
          vitalSigns: {
            bloodPressure: "118/76",
            heartRate: 68,
            temperature: 98.4,
            oxygenSaturation: 99,
          },
        },
      },
    ]);

    console.log("Created medical records:", medicalRecords.length);

    console.log("\n=== DATABASE SEEDED SUCCESSFULLY ===");
    console.log("=====================================");

    console.log("\n=== TEST DATA SUMMARY ===");
    console.log(`Patients: ${patients.length}`);
    patients.forEach((p) =>
      console.log(`- ${p.firstName} ${p.lastName} (ID: ${p._id})`)
    );

    console.log(`\nDoctors: ${doctors.length}`);
    // Fix: Use type assertion to access specialization
    doctors.forEach((d: any) =>
      console.log(`- Dr. ${d.firstName} ${d.lastName} (${d.specialization})`)
    );

    console.log(`\nNurses: ${nurses.length}`);
    console.log(`Pharmacists: ${pharmacists.length}`);

    console.log(`\nWards: ${wards.length}`);
    wards.forEach((w) =>
      console.log(
        `- ${w.name} (${w.type}): ${w.currentOccupancy}/${w.capacity} occupied`
      )
    );

    console.log(`\nBeds: ${beds.length}`);
    const availableBeds = beds.filter(
      (b) => b.status === BedStatus.AVAILABLE
    ).length;
    const occupiedBeds = beds.filter(
      (b) => b.status === BedStatus.OCCUPIED
    ).length;
    console.log(
      `- Available: ${availableBeds}, Occupied: ${occupiedBeds}, Maintenance: ${
        beds.length - availableBeds - occupiedBeds
      }`
    );

    console.log(`\nInventory Items: ${inventory.length}`);
    const lowStockItems = inventory.filter(
      (i) => i.quantityOnHand <= i.reorderLevel
    ).length;
    console.log(`- Low stock items: ${lowStockItems}`);

    console.log(`\nMedical Records: ${medicalRecords.length}`);
    const prescriptions = medicalRecords.filter(
      (r) => r.recordType === MedicalRecordType.PRESCRIPTION
    ).length;
    const labResults = medicalRecords.filter(
      (r) => r.recordType === MedicalRecordType.LAB
    ).length;
    const visitNotes = medicalRecords.filter(
      (r) => r.recordType === MedicalRecordType.VISIT_NOTE
    ).length;
    console.log(
      `- Prescriptions: ${prescriptions}, Lab Results: ${labResults}, Visit Notes: ${visitNotes}`
    );

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log(
      "PATIENT 1: National ID: PAT001, Password: password123 (John Doe)"
    );
    console.log(
      "PATIENT 2: National ID: PAT002, Password: password123 (Jane Smith)"
    );
    console.log(
      "DOCTOR 1: National ID: DOC001, Password: password123 (Dr. Robert Smith - Cardiology)"
    );
    console.log(
      "DOCTOR 2: National ID: DOC002, Password: password123 (Dr. Sarah Johnson - Pediatrics)"
    );
    console.log(
      "NURSE: National ID: NUR001, Password: password123 (Emily Brown)"
    );
    console.log(
      "PHARMACIST: National ID: PHA001, Password: password123 (Michael Wilson)"
    );

    console.log("\n=== KEY FEATURES TO TEST ===");
    console.log(
      "1. Medical Records: Both patients have multiple prescriptions and lab results"
    );
    console.log("2. Ward Management: Multiple beds available for allocation");
    console.log(
      "3. Pharmacy: All patients have active prescriptions for dispensing"
    );
    console.log(
      "4. Appointments: Book appointments between patients and doctors"
    );
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

seedData();
