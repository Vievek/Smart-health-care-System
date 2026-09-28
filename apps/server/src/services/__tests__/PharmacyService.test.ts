import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PharmacyService } from "../PharmacyService";
import { InventoryRepository } from "../../repositories/InventoryRepository";
import { DispenseTransactionRepository } from "../../repositories/DispenseTransactionRepository";
import { MedicalRecordService } from "../MedicalRecordService";
import {
  IInventoryItem,
  IDispenseTransaction,
  PrescriptionStatus,
  PaymentStatus,
  MedicalRecordType,
} from "../../test/types";

// Mock the repositories and services
jest.mock("../../repositories/InventoryRepository");
jest.mock("../../repositories/DispenseTransactionRepository");
jest.mock("../MedicalRecordService");

describe("PharmacyService", () => {
  let pharmacyService: PharmacyService;
  let mockInventoryRepo: jest.Mocked<InventoryRepository>;
  let mockTransactionRepo: jest.Mocked<DispenseTransactionRepository>;
  let mockMedicalRecordService: jest.Mocked<MedicalRecordService>;

  beforeEach(() => {
    mockInventoryRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findLowStockItems: jest.fn(),
      decrementStock: jest.fn(),
      findByBatchNumber: jest.fn(),
    } as any;

    mockTransactionRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByPatientId: jest.fn(),
      findByPrescriptionId: jest.fn(),
      findRecentTransactions: jest.fn(),
    } as any;

    mockMedicalRecordService = {
      getById: jest.fn(),
      update: jest.fn(),
    } as any;

    (InventoryRepository as jest.Mock).mockImplementation(
      () => mockInventoryRepo
    );
    (DispenseTransactionRepository as jest.Mock).mockImplementation(
      () => mockTransactionRepo
    );
    (MedicalRecordService as jest.Mock).mockImplementation(
      () => mockMedicalRecordService
    );

    pharmacyService = new PharmacyService(
      mockInventoryRepo,
      mockTransactionRepo,
      mockMedicalRecordService
    );
  });

  describe("dispenseMedication", () => {
    it("should dispense medication when stock is available", async () => {
      const dispenseData = {
        prescriptionId: "rx123",
        patientId: "patient123",
        pharmacistId: "pharm123",
        medications: [
          {
            medicationId: "med1",
            quantity: 1,
          },
        ],
      };

      const mockPrescription = {
        _id: "rx123",
        patientId: "patient123",
        recordType: MedicalRecordType.PRESCRIPTION,
        title: "Test Prescription",
        createdDate: new Date(),
        authorId: "doc123",
        attachments: [],
        prescription: {
          status: PrescriptionStatus.ACTIVE,
          medications: [
            {
              medicationId: "med1",
              name: "Test Medication",
              dosage: "10mg",
              frequency: "Once daily",
              duration: "30 days",
            },
          ],
          instructions: "Take as directed",
          issuedDate: new Date(),
          expiryDate: new Date(),
        },
      };

      const mockMedication: IInventoryItem = {
        _id: "med1",
        name: "Test Medication",
        genericName: "Test",
        batchNumber: "BATCH001",
        expiryDate: new Date("2025-12-31"),
        quantityOnHand: 10,
        reorderLevel: 5,
        price: 10,
        supplier: "Test Supplier",
      };

      const mockTransaction: IDispenseTransaction = {
        _id: "tx123",
        ...dispenseData,
        amount: 10,
        paymentStatus: PaymentStatus.PENDING,
        dispensedAt: new Date(),
      } as IDispenseTransaction;

      mockMedicalRecordService.getById.mockResolvedValue(
        mockPrescription as any
      );
      mockInventoryRepo.findById.mockResolvedValue(mockMedication);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockInventoryRepo.decrementStock.mockResolvedValue({
        ...mockMedication,
        quantityOnHand: 9,
      });

      const result = await pharmacyService.dispenseMedication(dispenseData);

      expect(mockMedicalRecordService.getById).toHaveBeenCalledWith("rx123");
      expect(mockInventoryRepo.findById).toHaveBeenCalledWith("med1");
      expect(mockTransactionRepo.create).toHaveBeenCalled();
      expect(mockInventoryRepo.decrementStock).toHaveBeenCalledWith("med1", 1);
      expect(mockMedicalRecordService.update).toHaveBeenCalledWith(
        "rx123",
        expect.objectContaining({
          prescription: expect.objectContaining({
            status: PrescriptionStatus.DISPENSED,
          }),
        })
      );
      expect(result).toEqual(mockTransaction);
    });

    it("should throw error when prescription is invalid", async () => {
      const dispenseData = {
        prescriptionId: "rx123",
        patientId: "patient123",
        pharmacistId: "pharm123",
        medications: [],
      };

      mockMedicalRecordService.getById.mockResolvedValue(null);

      await expect(
        pharmacyService.dispenseMedication(dispenseData)
      ).rejects.toThrow("Invalid prescription");
    });

    it("should throw error when stock is insufficient", async () => {
      const dispenseData = {
        prescriptionId: "rx123",
        patientId: "patient123",
        pharmacistId: "pharm123",
        medications: [
          {
            medicationId: "med1",
            quantity: 5,
          },
        ],
      };

      const mockPrescription = {
        _id: "rx123",
        recordType: MedicalRecordType.PRESCRIPTION,
        prescription: {
          status: PrescriptionStatus.ACTIVE,
          medications: [],
        },
      } as any;

      const mockMedication: IInventoryItem = {
        _id: "med1",
        name: "Test Medication",
        genericName: "Test",
        batchNumber: "BATCH001",
        expiryDate: new Date("2025-12-31"),
        quantityOnHand: 2, // Less than requested
        reorderLevel: 5,
        price: 10,
        supplier: "Test Supplier",
      };

      mockMedicalRecordService.getById.mockResolvedValue(mockPrescription);
      mockInventoryRepo.findById.mockResolvedValue(mockMedication);

      await expect(
        pharmacyService.dispenseMedication(dispenseData)
      ).rejects.toThrow("Insufficient stock");
    });
  });
});
