import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { WardManagement } from "../WardManagement";
import { WardService } from "../../../services/WardService";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole, BedStatus } from "@shared/healthcare-types";
import { mockWards, mockBeds } from "../../../test/mocks";

vi.mock("../../../services/WardService");
vi.mock("../../../services/UserService");
vi.mock("../../../contexts/AuthContext");

describe("WardManagement", () => {
  const mockGetWards = vi.fn();
  const mockGetAllBeds = vi.fn();
  const mockGetAvailableBeds = vi.fn();
  const mockUseAuth = useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock WardService with proper data and error handling
    (WardService as any).mockImplementation(() => ({
      getWards: mockGetWards.mockResolvedValue(mockWards),
      getAvailableBeds: mockGetAvailableBeds.mockResolvedValue(
        mockBeds.filter((b) => b.status === BedStatus.AVAILABLE)
      ),
      getAllBeds: mockGetAllBeds.mockResolvedValue(mockBeds),
      getBedsByWard: vi.fn().mockResolvedValue(mockBeds),
      getBedsByPatient: vi.fn().mockResolvedValue([]),
      allocateBed: vi.fn(),
      transferPatient: vi.fn(),
      dischargePatient: vi.fn(),
      createWard: vi.fn(),
    }));

    // Mock UserService
    vi.mock("../../../services/UserService", () => ({
      UserService: vi.fn(() => ({
        getAll: vi.fn().mockResolvedValue([]),
      })),
    }));

    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: {
        _id: "nurse123",
        role: UserRole.NURSE,
        firstName: "Emily",
        lastName: "Brown",
      },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });
  });

  it("should load and display wards and beds", async () => {
    render(<WardManagement />);

    await waitFor(() => {
      expect(screen.getByText("Ward & Bed Management")).toBeInTheDocument();
    });

    // Wait for wards to load and check for specific ward card
    await waitFor(() => {
      // Look for the specific ward card title that contains the full ward name
      const wardCardTitle = screen.getByText("ICU - Intensive Care Unit");
      expect(wardCardTitle).toBeInTheDocument();
    });

    // Verify that bed information is displayed
    await waitFor(() => {
      expect(screen.getByText("Bed ICU-01")).toBeInTheDocument();
      expect(screen.getByText("Available")).toBeInTheDocument();
    });
  });

  it("should show bed allocation options for staff", async () => {
    render(<WardManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Available Beds/i)).toBeInTheDocument();
    });

    // Verify search functionality is available
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Search beds by number or patient/i)
      ).toBeInTheDocument();
    });
  });

  it("should show patient view for patients", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: "patient123",
        role: UserRole.PATIENT,
        firstName: "John",
        lastName: "Doe",
      },
      isAuthenticated: true,
    });

    render(<WardManagement />);

    await waitFor(() => {
      expect(screen.getByText(/My Bed Information/i)).toBeInTheDocument();
    });
  });
});
