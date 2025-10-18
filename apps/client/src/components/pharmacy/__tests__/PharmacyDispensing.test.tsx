import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../test/utils";
import { PharmacyDispensing } from "../PharmacyDispensing";
import { PharmacyService } from "../../../services/PharmacyService";
import { useAuth } from "../../../contexts/AuthContext";

vi.mock("../../../services/PharmacyService");
vi.mock("../../../contexts/AuthContext");

const mockInventory = [
  {
    _id: "inv1",
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
    _id: "inv2",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    batchNumber: "BATCH002",
    expiryDate: new Date("2025-10-15"),
    quantityOnHand: 5, // Low stock
    reorderLevel: 30,
    price: 8.75,
    supplier: "MediSupply",
  },
];

const mockPrescriptions = [
  {
    _id: "rx1",
    patientId: "patient123",
    recordType: "prescription",
    title: "Antibiotic Course",
    description: "7-day antibiotic course",
    createdDate: new Date("2024-01-15"),
    authorId: "doc123",
    prescription: {
      medications: [
        {
          medicationId: "inv1",
          name: "Amoxicillin 500mg",
          dosage: "1 tablet",
          frequency: "3 times daily",
          duration: "7 days",
          instructions: "Take with food",
        },
      ],
      instructions: "Complete full course",
      issuedDate: new Date("2024-01-15"),
      expiryDate: new Date("2024-02-15"),
      status: "active",
    },
  },
];

describe("PharmacyDispensing", () => {
  const mockGetInventory = vi.fn();
  const mockGetPrescriptionsByPatient = vi.fn();
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { _id: "pharm123", role: "pharmacist" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    (
      PharmacyService as vi.MockedClass<typeof PharmacyService>
    ).mockImplementation(() => ({
      getInventory: mockGetInventory.mockResolvedValue(mockInventory),
      getLowStockItems: vi.fn(),
      dispenseMedication: vi.fn(),
      checkDrugInteractions: vi.fn(),
    }));
  });

  it("should load and display pharmacy inventory", async () => {
    render(<PharmacyDispensing />);

    await waitFor(() => {
      expect(screen.getByText("Pharmacy Dispensing")).toBeInTheDocument();
      expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
      expect(screen.getByText("Ibuprofen 400mg")).toBeInTheDocument();
    });
  });

  it("should show low stock warning", async () => {
    render(<PharmacyDispensing />);

    await waitFor(() => {
      expect(screen.getByText("Low Stock (1)")).toBeInTheDocument();
    });
  });

  it("should allow searching medications", async () => {
    render(<PharmacyDispensing />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search medications/i);
      fireEvent.change(searchInput, { target: { value: "Amoxicillin" } });
    });

    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
    expect(screen.queryByText("Ibuprofen 400mg")).not.toBeInTheDocument();
  });
});
