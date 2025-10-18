import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { PharmacyDispensing } from "../PharmacyDispensing";
import { PharmacyService } from "../../../services/PharmacyService";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "@shared/healthcare-types";
import { mockInventory } from "../../../test/mocks";

vi.mock("../../../services/PharmacyService");
vi.mock("../../../services/MedicalRecordService");
vi.mock("../../../contexts/AuthContext");

describe("PharmacyDispensing", () => {
  const mockGetInventory = vi.fn();
  const mockUseAuth = useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock PharmacyService
    (PharmacyService as any).mockImplementation(() => ({
      getInventory: mockGetInventory.mockResolvedValue(mockInventory),
      getLowStockItems: vi.fn().mockResolvedValue([]),
      dispenseMedication: vi.fn(),
      checkDrugInteractions: vi.fn().mockResolvedValue([]),
    }));

    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: {
        _id: "pharm123",
        role: UserRole.PHARMACIST,
        firstName: "Michael",
        lastName: "Wilson",
      },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });
  });

  it("should load and display pharmacy inventory", async () => {
    render(<PharmacyDispensing />);

    await waitFor(() => {
      expect(screen.getByText("Pharmacy Dispensing")).toBeInTheDocument();
    });

    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
  });

  it("should show new order button", async () => {
    render(<PharmacyDispensing />);

    await waitFor(() => {
      const orderButton = screen.getByRole("button", { name: /new order/i });
      expect(orderButton).toBeInTheDocument();
    });
  });
});
