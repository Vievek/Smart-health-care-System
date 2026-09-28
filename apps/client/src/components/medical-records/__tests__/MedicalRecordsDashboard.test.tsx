import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { MedicalRecordsDashboard } from "../MedicalRecordsDashboard";
import { MedicalRecordService } from "../../../services/MedicalRecordService";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "@shared/healthcare-types";
import { mockMedicalRecords } from "../../../test/mocks";

vi.mock("../../../services/MedicalRecordService");
vi.mock("../../../contexts/AuthContext");

describe("MedicalRecordsDashboard", () => {
  const mockGetRecords = vi.fn();
  const mockUseAuth = useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock MedicalRecordService
    (MedicalRecordService as any).mockImplementation(() => ({
      getRecords: mockGetRecords.mockResolvedValue(mockMedicalRecords),
      getRecordById: vi.fn(),
      downloadRecordPDF: vi.fn(),
      createPrescription: vi.fn(),
      getPrescriptionsByPatient: vi.fn(),
    }));

    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: {
        _id: "user123",
        role: UserRole.PATIENT,
        firstName: "John",
        lastName: "Doe",
      },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });
  });

  it("should load and display medical records", async () => {
    render(<MedicalRecordsDashboard userRole={UserRole.PATIENT} />);

    await waitFor(() => {
      expect(screen.getByText("Medical Records")).toBeInTheDocument();
    });

    expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
  });

  it("should show patient search for doctors", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: "doc123",
        role: UserRole.DOCTOR,
        firstName: "Jane",
        lastName: "Smith",
      },
      isAuthenticated: true,
    });

    render(<MedicalRecordsDashboard userRole={UserRole.DOCTOR} />);

    await waitFor(() => {
      const searchButton = screen.getByRole("button", {
        name: /search patients/i,
      });
      expect(searchButton).toBeInTheDocument();
    });
  });
});
