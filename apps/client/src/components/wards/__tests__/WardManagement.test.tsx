import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../test/utils";
import { WardManagement } from "../WardManagement";
import { WardService } from "../../../services/WardService";
import { useAuth } from "../../../contexts/AuthContext";

vi.mock("../../../services/WardService");
vi.mock("../../../contexts/AuthContext");

const mockWards = [
  {
    _id: "ward1",
    name: "ICU - Intensive Care Unit",
    type: "icu",
    capacity: 10,
    currentOccupancy: 2,
  },
  {
    _id: "ward2",
    name: "General Ward A",
    type: "general",
    capacity: 20,
    currentOccupancy: 15,
  },
];

const mockBeds = [
  {
    _id: "bed1",
    bedNumber: "ICU-01",
    wardId: "ward1",
    bedType: "icu",
    status: "available",
    features: ["Ventilator", "Monitor"],
  },
  {
    _id: "bed2",
    bedNumber: "ICU-02",
    wardId: "ward1",
    bedType: "icu",
    status: "occupied",
    patientId: "patient123",
    features: ["Ventilator", "Monitor"],
  },
];

describe("WardManagement", () => {
  const mockGetWards = vi.fn();
  const mockGetAllBeds = vi.fn();
  const mockGetAvailableBeds = vi.fn();
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { _id: "nurse123", role: "nurse" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    (WardService as vi.MockedClass<typeof WardService>).mockImplementation(
      () => ({
        getWards: mockGetWards.mockResolvedValue(mockWards),
        getAvailableBeds: mockGetAvailableBeds.mockResolvedValue(
          mockBeds.filter((b) => b.status === "available")
        ),
        getAllBeds: mockGetAllBeds.mockResolvedValue(mockBeds),
        getBedsByWard: vi.fn(),
        getBedsByPatient: vi.fn(),
        allocateBed: vi.fn(),
        transferPatient: vi.fn(),
        dischargePatient: vi.fn(),
        createWard: vi.fn(),
      })
    );
  });

  it("should load and display wards and beds", async () => {
    render(<WardManagement />);

    await waitFor(() => {
      expect(screen.getByText("Ward & Bed Management")).toBeInTheDocument();
      expect(screen.getByText("ICU - Intensive Care Unit")).toBeInTheDocument();
      expect(screen.getByText("General Ward A")).toBeInTheDocument();
    });
  });

  it("should show bed allocation options for staff", async () => {
    render(<WardManagement />);

    await waitFor(() => {
      expect(screen.getByText("Available Beds")).toBeInTheDocument();
    });
  });

  it("should allow selecting a ward", async () => {
    render(<WardManagement />);

    await waitFor(() => {
      const icuWard = screen.getByText("ICU - Intensive Care Unit");
      fireEvent.click(icuWard);
    });

    // Should show bed management for selected ward
    await waitFor(() => {
      expect(screen.getByText(/Bed Management/)).toBeInTheDocument();
    });
  });
});
