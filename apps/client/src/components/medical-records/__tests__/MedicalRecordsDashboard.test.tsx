import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../test/utils";
import { MedicalRecordsDashboard } from "../MedicalRecordsDashboard";
import { MedicalRecordService } from "../../../services/MedicalRecordService";
import { useAuth } from "../../../contexts/AuthContext";

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
  {
    _id: "record2",
    patientId: "user123",
    recordType: "prescription",
    title: "Medication Prescription",
    description: "Hypertension medication",
    createdDate: new Date("2024-01-10"),
    authorId: "doc123",
    prescription: {
      medications: [
        {
          medicationId: "med1",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
        },
      ],
      instructions: "Take with water",
      issuedDate: new Date("2024-01-10"),
      expiryDate: new Date("2024-02-10"),
      status: "active",
    },
  },
];

describe("MedicalRecordsDashboard", () => {
  const mockGetRecords = vi.fn();
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { _id: "user123", role: "patient" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    (
      MedicalRecordService as vi.MockedClass<typeof MedicalRecordService>
    ).mockImplementation(() => ({
      getRecords: mockGetRecords.mockResolvedValue(mockMedicalRecords),
      getRecordById: vi.fn(),
      downloadRecordPDF: vi.fn(),
      createPrescription: vi.fn(),
      getPrescriptionsByPatient: vi.fn(),
    }));
  });

  it("should load and display medical records", async () => {
    render(<MedicalRecordsDashboard userRole="patient" />);

    await waitFor(() => {
      expect(screen.getByText("Medical Records")).toBeInTheDocument();
      expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
      expect(screen.getByText("Medication Prescription")).toBeInTheDocument();
    });
  });

  it("should allow searching medical records", async () => {
    render(<MedicalRecordsDashboard userRole="patient" />);

    await waitFor(() => {
      expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search records/i);
    fireEvent.change(searchInput, { target: { value: "Blood" } });

    expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
    expect(
      screen.queryByText("Medication Prescription")
    ).not.toBeInTheDocument();
  });

  it("should open record detail modal when clicking a record", async () => {
    render(<MedicalRecordsDashboard userRole="patient" />);

    await waitFor(() => {
      expect(screen.getByText("Blood Test Results")).toBeInTheDocument();
    });

    const recordCard = screen.getByText("Blood Test Results");
    fireEvent.click(recordCard);

    await waitFor(() => {
      expect(screen.getByText("Record Type")).toBeInTheDocument();
      expect(screen.getByText("lab")).toBeInTheDocument();
    });
  });

  it("should show patient search for doctors", async () => {
    mockUseAuth.mockReturnValue({
      user: { _id: "doc123", role: "doctor" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    render(<MedicalRecordsDashboard userRole="doctor" />);

    expect(screen.getByText("Search Patients")).toBeInTheDocument();
  });
});
