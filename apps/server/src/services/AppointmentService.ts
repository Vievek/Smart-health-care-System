import { IAppointment, AppointmentStatus } from "@shared/healthcare-types";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { IService } from "../core/interfaces/IService";

export class AppointmentService implements IService<IAppointment> {
  constructor(
    private appointmentRepo: AppointmentRepository = new AppointmentRepository()
  ) {}

  async getById(id: string): Promise<IAppointment | null> {
    return this.appointmentRepo.findById(id);
  }

  async getAll(filter?: any): Promise<IAppointment[]> {
    return this.appointmentRepo.findAll(filter);
  }

  async create(data: Partial<IAppointment>): Promise<IAppointment> {
    // Check for slot availability
    const existingAppointment = await this.appointmentRepo.findByDoctorAndTime(
      data.doctorId!,
      data.dateTime!
    );

    if (existingAppointment) {
      throw new Error("Appointment slot not available");
    }

    return this.appointmentRepo.create({
      ...data,
      status: AppointmentStatus.PENDING,
    });
  }

  async update(
    id: string,
    data: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.appointmentRepo.delete(id);
  }

  async getDoctorAppointments(doctorId: string): Promise<IAppointment[]> {
    return this.appointmentRepo.findByDoctorId(doctorId);
  }

  async getPatientAppointments(patientId: string): Promise<IAppointment[]> {
    return this.appointmentRepo.findByPatientId(patientId);
  }

  async cancelAppointment(id: string): Promise<IAppointment | null> {
    return this.appointmentRepo.update(id, {
      status: AppointmentStatus.CANCELLED,
    });
  }

  async rescheduleAppointment(
    id: string,
    newDateTime: Date
  ): Promise<IAppointment | null> {
    const appointment = await this.getById(id);
    if (!appointment) return null;

    // Check new slot availability
    const existing = await this.appointmentRepo.findByDoctorAndTime(
      appointment.doctorId,
      newDateTime
    );

    if (existing && existing._id !== id) {
      throw new Error("New appointment slot not available");
    }

    return this.appointmentRepo.update(id, {
      dateTime: newDateTime,
      status: AppointmentStatus.RESCHEDULED,
    });
  }
}
