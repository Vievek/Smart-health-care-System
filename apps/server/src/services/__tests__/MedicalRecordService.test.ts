import { MedicalRecordService } from "../MedicalRecordService";
import { MedicalRecordRepository } from "../../repositories/MedicalRecordRepository";
import { IMedicalRecord, MedicalRecordType } from "@shared/healthcare-types";

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

      const expectedRecord = {
        ...prescriptionData,
        recordType: MedicalRecordType.PRESCRIPTION,
        title: expect.any(String),
      };

      mockMedicalRecordRepo.create.mockResolvedValue(
        expectedRecord as IMedicalRecord
      );

      const result = await medicalRecordService.createPrescription(
        prescriptionData
      );

      expect(mockMedicalRecordRepo.create).toHaveBeenCalledWith(expectedRecord);
      expect(result.recordType).toBe(MedicalRecordType.PRESCRIPTION);
    });
  });
});
