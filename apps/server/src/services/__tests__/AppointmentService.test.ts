import { AppointmentService } from "../AppointmentService";
import { AppointmentRepository } from "../../repositories/AppointmentRepository";
import { IAppointment, AppointmentStatus } from "@shared/healthcare-types";

describe("AppointmentService", () => {
  let appointmentService: AppointmentService;
  let mockAppointmentRepo: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    mockAppointmentRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByDoctorId: jest.fn(),
      findByPatientId: jest.fn(),
      findByDoctorAndTime: jest.fn(),
      findUpcomingAppointments: jest.fn(),
    } as any;

    appointmentService = new AppointmentService(mockAppointmentRepo);
  });

  describe("create", () => {
    it("should create appointment when slot is available", async () => {
      const appointmentData = {
        patientId: "patient123",
        doctorId: "doctor123",
        dateTime: new Date("2024-12-25T10:00:00Z"),
        duration: 30,
        reason: "Checkup",
      };

      mockAppointmentRepo.findByDoctorAndTime.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue({
        ...appointmentData,
        _id: "appt123",
        status: AppointmentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await appointmentService.create(appointmentData);

      expect(mockAppointmentRepo.findByDoctorAndTime).toHaveBeenCalledWith(
        "doctor123",
        appointmentData.dateTime
      );
      expect(mockAppointmentRepo.create).toHaveBeenCalledWith({
        ...appointmentData,
        status: AppointmentStatus.PENDING,
      });
      expect(result.status).toBe(AppointmentStatus.PENDING);
    });

    it("should throw error when slot is not available", async () => {
      const appointmentData = {
        patientId: "patient123",
        doctorId: "doctor123",
        dateTime: new Date("2024-12-25T10:00:00Z"),
        duration: 30,
        reason: "Checkup",
      };

      const existingAppointment = {
        _id: "existing123",
        patientId: "patient456",
        doctorId: "doctor123",
        dateTime: appointmentData.dateTime,
        status: AppointmentStatus.CONFIRMED,
      } as IAppointment;

      mockAppointmentRepo.findByDoctorAndTime.mockResolvedValue(
        existingAppointment
      );

      await expect(appointmentService.create(appointmentData)).rejects.toThrow(
        "Appointment slot not available"
      );
    });
  });

  describe("cancelAppointment", () => {
    it("should cancel an appointment", async () => {
      const appointmentId = "appt123";
      const updatedAppointment = {
        _id: appointmentId,
        status: AppointmentStatus.CANCELLED,
      } as IAppointment;

      mockAppointmentRepo.update.mockResolvedValue(updatedAppointment);

      const result = await appointmentService.cancelAppointment(appointmentId);

      expect(mockAppointmentRepo.update).toHaveBeenCalledWith(appointmentId, {
        status: AppointmentStatus.CANCELLED,
      });
      expect(result?.status).toBe(AppointmentStatus.CANCELLED);
    });
  });
});
