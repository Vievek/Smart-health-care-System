import { describe, it, vi } from "vitest";
import { render } from "../../test/utils";
import { useAuth } from "../../contexts/AuthContext";
import { WardManagement } from "../wards/WardManagement";
import { AppointmentBooking } from "../appointments/AppointmentBooking";

// Mock the auth context
vi.mock("../../contexts/AuthContext");

describe("Debug Test", () => {
  it("should render WardManagement and show actual content", () => {
    (useAuth as any).mockReturnValue({
      user: { _id: "test", role: "nurse" },
      isAuthenticated: true,
    });

    render(<WardManagement />);

    // Debug what's actually in the DOM
    console.log("WardManagement DOM content:", document.body.innerHTML);
  });

  it("should render AppointmentBooking and show actual content", () => {
    (useAuth as any).mockReturnValue({
      user: { _id: "user123", role: "patient" },
      isAuthenticated: true,
    });

    render(<AppointmentBooking />);

    // Debug what's actually in the DOM
    console.log("AppointmentBooking DOM content:", document.body.innerHTML);
  });
});
