import { WardService } from "../WardService";
import { WardRepository } from "../../repositories/WardRepository";
import { BedRepository } from "../../repositories/BedRepository";
import { IWard, IBed, BedStatus } from "@shared/healthcare-types";

describe("WardService", () => {
  let wardService: WardService;
  let mockWardRepo: jest.Mocked<WardRepository>;
  let mockBedRepo: jest.Mocked<BedRepository>;

  beforeEach(() => {
    mockWardRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
      findAvailableWards: jest.fn(),
    } as any;

    mockBedRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAvailableBeds: jest.fn(),
      findByWardId: jest.fn(),
      countOccupiedBeds: jest.fn(),
      findByPatientId: jest.fn(),
      updatePatientBed: jest.fn(),
      clearPatientFromBed: jest.fn(),
    } as any;

    wardService = new WardService(mockWardRepo, mockBedRepo);
  });

  describe("allocateBed", () => {
    it("should allocate bed to patient", async () => {
      const bedId = "bed123";
      const patientId = "patient123";
      const wardId = "ward123";

      const mockBed: IBed = {
        _id: bedId,
        bedNumber: "ICU-01",
        wardId,
        bedType: "icu",
        status: BedStatus.AVAILABLE,
        features: [],
      };

      const updatedBed: IBed = {
        ...mockBed,
        patientId,
        status: BedStatus.OCCUPIED,
      };

      mockBedRepo.findById.mockResolvedValue(mockBed);
      mockBedRepo.findByPatientId.mockResolvedValue(null);
      mockBedRepo.update.mockResolvedValue(updatedBed);
      mockBedRepo.countOccupiedBeds.mockResolvedValue(1);

      const result = await wardService.allocateBed(bedId, patientId);

      expect(mockBedRepo.findById).toHaveBeenCalledWith(bedId);
      expect(mockBedRepo.findByPatientId).toHaveBeenCalledWith(patientId);
      expect(mockBedRepo.update).toHaveBeenCalledWith(bedId, {
        patientId,
        status: BedStatus.OCCUPIED,
      });
      expect(result?.patientId).toBe(patientId);
      expect(result?.status).toBe(BedStatus.OCCUPIED);
    });

    it("should throw error when bed is not available", async () => {
      const bedId = "bed123";
      const patientId = "patient123";

      const occupiedBed: IBed = {
        _id: bedId,
        bedNumber: "ICU-01",
        wardId: "ward123",
        bedType: "icu",
        status: BedStatus.OCCUPIED,
        patientId: "otherPatient",
        features: [],
      };

      mockBedRepo.findById.mockResolvedValue(occupiedBed);

      await expect(wardService.allocateBed(bedId, patientId)).rejects.toThrow(
        "Bed not available"
      );
    });
  });

  describe("dischargePatient", () => {
    it("should discharge patient from bed", async () => {
      const bedId = "bed123";
      const patientId = "patient123";

      const occupiedBed: IBed = {
        _id: bedId,
        bedNumber: "ICU-01",
        wardId: "ward123",
        bedType: "icu",
        status: BedStatus.OCCUPIED,
        patientId,
        features: [],
      };

      const availableBed: IBed = {
        ...occupiedBed,
        patientId: undefined,
        status: BedStatus.AVAILABLE,
      };

      mockBedRepo.findById.mockResolvedValue(occupiedBed);
      mockBedRepo.update.mockResolvedValue(availableBed);
      mockBedRepo.countOccupiedBeds.mockResolvedValue(0);

      const result = await wardService.dischargePatient(bedId);

      expect(mockBedRepo.findById).toHaveBeenCalledWith(bedId);
      expect(mockBedRepo.update).toHaveBeenCalledWith(bedId, {
        $unset: { patientId: "" },
        status: BedStatus.AVAILABLE,
      });
      expect(result?.status).toBe(BedStatus.AVAILABLE);
      expect(result?.patientId).toBeUndefined();
    });
  });
});
