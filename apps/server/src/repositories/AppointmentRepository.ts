import { Appointment } from "../models/Appointment";
import { BaseRepository } from "../core/base/BaseRepository";
import { IAppointment } from "@shared/healthcare-types";

export class AppointmentRepository extends BaseRepository<IAppointment> {
  constructor() {
    super(Appointment);
  }

  async findByDoctorId(doctorId: string): Promise<IAppointment[]> {
    const results = await this.model.find({ doctorId }).sort({ dateTime: 1 });
    return results.map((result: any) => result._doc);
  }

  async findByPatientId(patientId: string): Promise<IAppointment[]> {
    const results = await this.model.find({ patientId }).sort({ dateTime: 1 });
    return results.map((result: any) => result._doc);
  }

  async findByDoctorAndTime(
    doctorId: string,
    dateTime: Date
  ): Promise<IAppointment | null> {
    const result = await this.model.findOne({
      doctorId,
      dateTime,
      status: { $in: ["pending", "confirmed"] },
    });
    return result ? (result as any)._doc : null;
  }

  async findUpcomingAppointments(): Promise<IAppointment[]> {
    const results = await this.model.find({
      dateTime: { $gte: new Date() },
      status: { $in: ["pending", "confirmed"] },
    });
    return results.map((result: any) => result._doc);
  }
}
