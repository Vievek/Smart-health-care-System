import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { AppointmentBooking } from "../AppointmentBooking";
import { AppointmentService } from "../../../services/AppointmentService";
import { UserService } from "../../../services/UserService";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "@shared/healthcare-types";
import { mockAppointments, mockUsers } from "../../../test/mocks";

// Mock services and hooks
vi.mock("../../../services/AppointmentService");
vi.mock("../../../services/UserService");
vi.mock("../../../contexts/AuthContext");

describe("AppointmentBooking", () => {
  const mockGetAppointments = vi.fn();
  const mockGetDoctors = vi.fn();
  const mockGetPatients = vi.fn();
  const mockUseAuth = useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock AppointmentService
    (AppointmentService as any).mockImplementation(() => ({
      getAppointments: mockGetAppointments.mockResolvedValue(mockAppointments),
      createAppointment: vi.fn(),
      cancelAppointment: vi.fn(),
      rescheduleAppointment: vi.fn(),
    }));

    // Mock UserService with proper data
    (UserService as any).mockImplementation(() => ({
      getDoctors: mockGetDoctors.mockResolvedValue(
        mockUsers.filter((u) => u.role === UserRole.DOCTOR)
      ),
      getUsersByRole: mockGetPatients.mockImplementation((role: UserRole) =>
        Promise.resolve(mockUsers.filter((u) => u.role === role))
      ),
      getAll: vi.fn().mockResolvedValue(mockUsers),
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

  it("should load and display appointments", async () => {
    render(<AppointmentBooking />);

    // Wait for the component to load and resolve all API calls
    await waitFor(
      () => {
        expect(screen.getByText(/Appointment Management/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // The appointment should show the doctor's name
    // Wait for the appointment card to appear with the doctor name
    await waitFor(
      () => {
        // Look for the appointment card that contains the doctor name
        // Since the mock data has doctor ID "doc123" which maps to "Robert Smith"
        const doctorNameElement = screen.getByText("Dr. Robert Smith");
        expect(doctorNameElement).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/Regular checkup/i)).toBeInTheDocument();
  });

  it("should show book new appointment button for patients", async () => {
    render(<AppointmentBooking />);

    await waitFor(() => {
      const button = screen.getByRole("button", {
        name: /book new appointment/i,
      });
      expect(button).toBeInTheDocument();
    });
  });

  it("should show different header for doctors", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: "doc123",
        role: UserRole.DOCTOR,
        firstName: "Robert",
        lastName: "Smith",
      },
      isAuthenticated: true,
    });

    render(<AppointmentBooking />);

    await waitFor(() => {
      expect(screen.getByText(/Doctor Appointments/i)).toBeInTheDocument();
    });
  });
});
