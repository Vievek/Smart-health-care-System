import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AppointmentService } from "../AppointmentService";
import { AppointmentRepository } from "../../repositories/AppointmentRepository";
import { IAppointment, AppointmentStatus } from "../../test/types";

// Mock the repository
jest.mock("../../repositories/AppointmentRepository");

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

    (AppointmentRepository as jest.Mock).mockImplementation(
      () => mockAppointmentRepo
    );
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

      const mockAppointment: IAppointment = {
        _id: "appt123",
        ...appointmentData,
        status: AppointmentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAppointmentRepo.findByDoctorAndTime.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue(mockAppointment);

      const result = await appointmentService.create(appointmentData);

      expect(mockAppointmentRepo.findByDoctorAndTime).toHaveBeenCalledWith(
        "doctor123",
        appointmentData.dateTime
      );
      expect(result.status).toBe(AppointmentStatus.PENDING);
      expect(result._id).toBe("appt123");
    });

    it("should throw error when appointment slot is not available", async () => {
      const appointmentData = {
        patientId: "patient123",
        doctorId: "doctor123",
        dateTime: new Date("2024-12-25T10:00:00Z"),
        duration: 30,
        reason: "Checkup",
      };

      const existingAppointment: IAppointment = {
        _id: "existing123",
        ...appointmentData,
        status: AppointmentStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAppointmentRepo.findByDoctorAndTime.mockResolvedValue(
        existingAppointment
      );

      await expect(appointmentService.create(appointmentData)).rejects.toThrow(
        "Appointment slot not available"
      );
    });
  });

  describe("getDoctorAppointments", () => {
    it("should return appointments for a doctor", async () => {
      const doctorId = "doctor123";
      const mockAppointments: IAppointment[] = [
        {
          _id: "appt1",
          patientId: "patient1",
          doctorId,
          dateTime: new Date("2024-12-25T10:00:00Z"),
          duration: 30,
          status: AppointmentStatus.CONFIRMED,
          reason: "Checkup",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAppointmentRepo.findByDoctorId.mockResolvedValue(mockAppointments);

      const result = await appointmentService.getDoctorAppointments(doctorId);

      expect(mockAppointmentRepo.findByDoctorId).toHaveBeenCalledWith(doctorId);
      expect(result).toEqual(mockAppointments);
      expect(result[0].doctorId).toBe(doctorId);
    });
  });

  describe("cancelAppointment", () => {
    it("should cancel an appointment", async () => {
      const appointmentId = "appt123";
      const existingAppointment: IAppointment = {
        _id: appointmentId,
        patientId: "patient123",
        doctorId: "doctor123",
        dateTime: new Date("2024-12-25T10:00:00Z"),
        duration: 30,
        status: AppointmentStatus.CONFIRMED,
        reason: "Checkup",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cancelledAppointment: IAppointment = {
        ...existingAppointment,
        status: AppointmentStatus.CANCELLED,
      };

      mockAppointmentRepo.update.mockResolvedValue(cancelledAppointment);

      const result = await appointmentService.cancelAppointment(appointmentId);

      expect(mockAppointmentRepo.update).toHaveBeenCalledWith(appointmentId, {
        status: AppointmentStatus.CANCELLED,
      });
      expect(result?.status).toBe(AppointmentStatus.CANCELLED);
    });
  });
});
