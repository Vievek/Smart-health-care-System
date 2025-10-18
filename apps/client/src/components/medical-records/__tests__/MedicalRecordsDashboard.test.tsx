import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { MedicalRecordsDashboard } from "../MedicalRecordsDashboard";
import { MedicalRecordService } from "../../../services/MedicalRecordService";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "@shared/healthcare-types";

// Mock services and hooks
vi.mock("../../../services/MedicalRecordService");
vi.mock("../../../contexts/AuthContext");

const mockMedicalRecords = [
  {
    _id: "record1",
    patientId: "user123",
    recordType: "lab",
    title: "Blood Test Results",
    description: "Complete blood count test",
    createdDate: new Date("2024-01-15"),
    authorId: "doc123",
  },
];

describe("MedicalRecordsDashboard", () => {
  const mockGetRecords = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { _id: "user123", role: UserRole.PATIENT },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    (MedicalRecordService as any).mockImplementation(() => ({
      getRecords: mockGetRecords.mockResolvedValue(mockMedicalRecords),
      getRecordById: vi.fn(),
      downloadRecordPDF: vi.fn(),
      createPrescription: vi.fn(),
      getPrescriptionsByPatient: vi.fn(),
    }));
  });

  it("should load and display medical records", async () => {
    render(<MedicalRecordsDashboard userRole={UserRole.PATIENT} />);

    await waitFor(() => {
      expect(screen.getByText("Medical Records")).toBeInTheDocument();
      expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
    });
  });
});
