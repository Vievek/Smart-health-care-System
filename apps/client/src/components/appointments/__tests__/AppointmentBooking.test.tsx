import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../test/utils";
import { AppointmentBooking } from "../AppointmentBooking";
import { AppointmentService } from "../../../services/AppointmentService";
import { useAuth } from "../../../contexts/AuthContext";

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

const mockDoctors = [
  {
    _id: "doc123",
    nationalId: "DOC001",
    email: "doctor@test.com",
    phone: "+1234567890",
    firstName: "John",
    lastName: "Smith",
    role: "doctor",
    specialization: "Cardiology",
    address: "123 Test St",
  },
];

describe("AppointmentBooking", () => {
  const mockGetAppointments = vi.fn();
  const mockGetDoctors = vi.fn();
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
      AppointmentService as vi.MockedClass<typeof AppointmentService>
    ).mockImplementation(() => ({
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

  it("should navigate through appointment booking steps", async () => {
    render(<AppointmentBooking />);

    // Start booking process
    const bookButton = screen.getByText("Book New Appointment");
    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(screen.getByText("Select Doctor")).toBeInTheDocument();
    });
  });
});
