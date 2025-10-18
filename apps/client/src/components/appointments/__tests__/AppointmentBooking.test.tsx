import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { AppointmentBooking } from "../AppointmentBooking";
import { AppointmentService } from "../../../services/AppointmentService";
import { useAuth } from "../../../contexts/AuthContext";

// Mock services and hooks
vi.mock("../../../services/AppointmentService");
vi.mock("../../../contexts/AuthContext");

const mockAppointments = [
  {
    _id: "appt1",
    patientId: "user123",
    doctorId: "doc123",
    dateTime: new Date("2024-12-25T10:00:00Z"),
    duration: 30,
    status: "confirmed",
    reason: "Regular checkup",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("AppointmentBooking", () => {
  const mockGetAppointments = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth
    (useAuth as any).mockReturnValue({
      user: { _id: "user123", role: "patient" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    // Mock AppointmentService
    (AppointmentService as any).mockImplementation(() => ({
      getAppointments: mockGetAppointments.mockResolvedValue(mockAppointments),
      createAppointment: vi.fn(),
      cancelAppointment: vi.fn(),
      rescheduleAppointment: vi.fn(),
    }));
  });

  it("should load and display appointments", async () => {
    render(<AppointmentBooking />);

    await waitFor(() => {
      expect(screen.getByText("Appointment Management")).toBeInTheDocument();
      expect(screen.getByText("Regular checkup")).toBeInTheDocument();
    });
  });

  it("should show book new appointment button for patients", async () => {
    render(<AppointmentBooking />);

    await waitFor(() => {
      expect(screen.getByText("Book New Appointment")).toBeInTheDocument();
    });
  });
});
