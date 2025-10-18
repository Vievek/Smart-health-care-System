import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../index";
import { User } from "../../models/User";
import { Appointment } from "../../models/Appointment";

describe("Appointment API Integration Tests", () => {
  let patientToken: string;
  let doctorToken: string;
  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    // Create test users
    const patient = await User.create({
      nationalId: "TEST_PATIENT",
      email: "patient@test.com",
      phone: "+1234567890",
      firstName: "Test",
      lastName: "Patient",
      role: "patient",
      passwordHash: "hashedpassword",
      address: "Test Address",
    });

    const doctor = await User.create({
      nationalId: "TEST_DOCTOR",
      email: "doctor@test.com",
      phone: "+1234567891",
      firstName: "Test",
      lastName: "Doctor",
      role: "doctor",
      specialization: "Cardiology",
      licenseNumber: "TEST123",
      passwordHash: "hashedpassword",
      address: "Test Address",
    });

    patientId = patient._id.toString();
    doctorId = doctor._id.toString();

    // Get tokens (in real scenario, use auth endpoint)
    patientToken = "mock-patient-token";
    doctorToken = "mock-doctor-token";
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Appointment.deleteMany({});
  });

  describe("POST /api/appointments", () => {
    it("should create an appointment", async () => {
      const appointmentData = {
        doctorId,
        dateTime: new Date("2024-12-25T10:00:00Z").toISOString(),
        duration: 30,
        reason: "Checkup",
      };

      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.status).toBe("pending");
    });
  });

  describe("GET /api/appointments", () => {
    it("should return appointments for patient", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return appointments for doctor", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
