import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { MedicalRecordService } from "../MedicalRecordService";
import { MedicalRecordRepository } from "../../repositories/MedicalRecordRepository";
import { IMedicalRecord, MedicalRecordType } from "../../test/types";

// Mock the repository
jest.mock("../../repositories/MedicalRecordRepository");

describe("MedicalRecordService", () => {
  let medicalRecordService: MedicalRecordService;
  let mockMedicalRecordRepo: jest.Mocked<MedicalRecordRepository>;

  beforeEach(() => {
    mockMedicalRecordRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByPatientId: jest.fn(),
      findByDoctorId: jest.fn(),
      findPrescriptionsByPatient: jest.fn(),
    } as any;

    (MedicalRecordRepository as jest.Mock).mockImplementation(
      () => mockMedicalRecordRepo
    );
    medicalRecordService = new MedicalRecordService(mockMedicalRecordRepo);
  });

  describe("getPatientRecords", () => {
    it("should return patient records for patient role", async () => {
      const mockRecords: IMedicalRecord[] = [
        {
          _id: "record1",
          patientId: "patient123",
          recordType: MedicalRecordType.LAB,
          title: "Blood Test",
          createdDate: new Date(),
          authorId: "doc123",
          attachments: [],
        } as IMedicalRecord,
      ];

      mockMedicalRecordRepo.findByPatientId.mockResolvedValue(mockRecords);

      const result = await medicalRecordService.getPatientRecords(
        "patient123",
        "patient"
      );

      expect(mockMedicalRecordRepo.findByPatientId).toHaveBeenCalledWith(
        "patient123"
      );
      expect(result).toEqual(mockRecords);
    });

    it("should return patient records for doctor role", async () => {
      const mockRecords: IMedicalRecord[] = [
        {
          _id: "record1",
          patientId: "patient123",
          recordType: MedicalRecordType.PRESCRIPTION,
          title: "Medication",
          createdDate: new Date(),
          authorId: "doc123",
          attachments: [],
        } as IMedicalRecord,
      ];

      mockMedicalRecordRepo.findByPatientId.mockResolvedValue(mockRecords);

      const result = await medicalRecordService.getPatientRecords(
        "patient123",
        "doctor"
      );

      expect(mockMedicalRecordRepo.findByPatientId).toHaveBeenCalledWith(
        "patient123"
      );
      expect(result).toEqual(mockRecords);
    });
  });

  describe("createPrescription", () => {
    it("should create a prescription record", async () => {
      const prescriptionData = {
        patientId: "patient123",
        authorId: "doc123",
        medications: [
          {
            medicationId: "med1",
            name: "Test Medication",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "30 days",
          },
        ],
        instructions: "Take with food",
      };

      const mockCreatedRecord: IMedicalRecord = {
        _id: "record123",
        patientId: "patient123",
        authorId: "doc123",
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Prescription - " + new Date().toLocaleDateString(),
        createdDate: new Date(),
        attachments: [],
        prescription: {
          medications: prescriptionData.medications,
          instructions: prescriptionData.instructions,
          issuedDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: "active" as any,
        },
      };

      mockMedicalRecordRepo.create.mockResolvedValue(mockCreatedRecord);

      const result = await medicalRecordService.createPrescription(
        prescriptionData
      );

      // FIXED: Match the actual flattened structure that the service sends
      expect(mockMedicalRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recordType: MedicalRecordType.PRESCRIPTION,
          patientId: "patient123",
          authorId: "doc123",
          title: expect.any(String),
          instructions: "Take with food",
          medications: [
            {
              medicationId: "med1",
              name: "Test Medication",
              dosage: "10mg",
              frequency: "Once daily",
              duration: "30 days",
            },
          ],
        })
      );

      expect(result.recordType).toBe(MedicalRecordType.PRESCRIPTION);
      expect(result.prescription?.medications).toHaveLength(1);
      expect(result.prescription?.medications[0].name).toBe("Test Medication");
    });
  });

  describe("getPrescriptionsByPatient", () => {
    it("should return prescriptions for a patient", async () => {
      const patientId = "patient123";
      const mockPrescriptions: IMedicalRecord[] = [
        {
          _id: "rx1",
          patientId,
          recordType: MedicalRecordType.PRESCRIPTION,
          title: "Test Prescription",
          createdDate: new Date(),
          authorId: "doc123",
          attachments: [],
          prescription: {
            medications: [
              {
                medicationId: "med1",
                name: "Test Med",
                dosage: "10mg",
                frequency: "Once daily",
                duration: "30 days",
              },
            ],
            instructions: "Take as directed",
            issuedDate: new Date(),
            expiryDate: new Date(),
            status: "active" as any,
          },
        },
      ];

      mockMedicalRecordRepo.findPrescriptionsByPatient.mockResolvedValue(
        mockPrescriptions
      );

      const result = await medicalRecordService.getPrescriptionsByPatient(
        patientId
      );

      expect(
        mockMedicalRecordRepo.findPrescriptionsByPatient
      ).toHaveBeenCalledWith(patientId);
      expect(result).toEqual(mockPrescriptions);
      expect(result[0].recordType).toBe(MedicalRecordType.PRESCRIPTION);
    });
  });

  describe("getById", () => {
    it("should return a medical record by id", async () => {
      const recordId = "record123";
      const mockRecord: IMedicalRecord = {
        _id: recordId,
        patientId: "patient123",
        recordType: MedicalRecordType.LAB,
        title: "Blood Test",
        createdDate: new Date(),
        authorId: "doc123",
        attachments: [],
      };

      mockMedicalRecordRepo.findById.mockResolvedValue(mockRecord);

      const result = await medicalRecordService.getById(recordId);

      expect(mockMedicalRecordRepo.findById).toHaveBeenCalledWith(recordId);
      expect(result).toEqual(mockRecord);
    });

    it("should return null when record not found", async () => {
      const recordId = "nonexistent";
      mockMedicalRecordRepo.findById.mockResolvedValue(null);

      const result = await medicalRecordService.getById(recordId);

      expect(mockMedicalRecordRepo.findById).toHaveBeenCalledWith(recordId);
      expect(result).toBeNull();
    });
  });
});
