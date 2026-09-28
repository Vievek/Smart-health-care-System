import { vi } from "vitest";
import { mockUsers } from "./mocks";
import { UserRole } from "@shared/healthcare-types";

export const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Mock all services that make API calls
vi.mock("../core/services/ApiService", () => ({
  ApiService: vi.fn(() => mockApiService),
}));

vi.mock("../services/AppointmentService", () => ({
  AppointmentService: vi.fn(() => ({
    getAppointments: vi.fn().mockResolvedValue([]),
    createAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    rescheduleAppointment: vi.fn(),
  })),
}));

vi.mock("../services/MedicalRecordService", () => ({
  MedicalRecordService: vi.fn(() => ({
    getRecords: vi.fn().mockResolvedValue([]),
    getRecordById: vi.fn(),
    downloadRecordPDF: vi.fn(),
    createPrescription: vi.fn(),
    getPrescriptionsByPatient: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock("../services/PharmacyService", () => ({
  PharmacyService: vi.fn(() => ({
    getInventory: vi.fn().mockResolvedValue([]),
    getLowStockItems: vi.fn().mockResolvedValue([]),
    dispenseMedication: vi.fn(),
    checkDrugInteractions: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock("../services/WardService", () => ({
  WardService: vi.fn(() => ({
    getWards: vi.fn().mockResolvedValue([]),
    getAvailableBeds: vi.fn().mockResolvedValue([]),
    getAllBeds: vi.fn().mockResolvedValue([]),
    getBedsByWard: vi.fn().mockResolvedValue([]),
    getBedsByPatient: vi.fn().mockResolvedValue([]),
    allocateBed: vi.fn(),
    transferPatient: vi.fn(),
    dischargePatient: vi.fn(),
    createWard: vi.fn(),
  })),
}));

// FIXED: Enhanced UserService mock with proper implementation
vi.mock("../services/UserService", () => ({
  UserService: vi.fn(() => ({
    getDoctors: vi
      .fn()
      .mockResolvedValue(mockUsers.filter((u) => u.role === UserRole.DOCTOR)),
    getDoctorById: vi.fn(),
    getUsersByRole: vi.fn().mockImplementation((role: UserRole) => {
      return Promise.resolve(mockUsers.filter((u) => u.role === role));
    }),
    getAll: vi.fn().mockResolvedValue(mockUsers),
  })),
}));
