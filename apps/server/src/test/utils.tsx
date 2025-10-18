import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data factories
export const mockUser = {
  _id: "user123",
  nationalId: "PAT001",
  email: "patient@test.com",
  phone: "+1234567890",
  firstName: "John",
  lastName: "Doe",
  role: "patient",
  address: "123 Test St",
};

export const mockDoctor = {
  _id: "doc123",
  nationalId: "DOC001",
  email: "doctor@test.com",
  phone: "+1234567891",
  firstName: "Jane",
  lastName: "Smith",
  role: "doctor",
  specialization: "Cardiology",
  address: "456 Test St",
};

export const mockAppointment = {
  _id: "appt123",
  patientId: "user123",
  doctorId: "doc123",
  dateTime: new Date("2024-12-25T10:00:00Z"),
  duration: 30,
  status: "pending",
  reason: "Regular checkup",
  createdAt: new Date(),
  updatedAt: new Date(),
};
