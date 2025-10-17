import { IAppointment } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IAppointmentService {
  getAppointments(): Promise<IAppointment[]>;
  createAppointment(data: any): Promise<IAppointment>;
  cancelAppointment(id: string): Promise<IAppointment>;
  rescheduleAppointment(id: string, newDateTime: Date): Promise<IAppointment>;
}

export class AppointmentService implements IAppointmentService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getAppointments(): Promise<IAppointment[]> {
    try {
      const appointments = await this.apiService.get<IAppointment[]>(
        "/appointments"
      );
      console.log(
        "AppointmentService: Loaded appointments:",
        appointments.length
      );
      return appointments;
    } catch (error) {
      console.error("AppointmentService: Failed to load appointments:", error);
      throw error;
    }
  }

  async createAppointment(data: any): Promise<IAppointment> {
    try {
      const appointment = await this.apiService.post<IAppointment>(
        "/appointments",
        data
      );
      console.log("AppointmentService: Appointment created successfully");
      return appointment;
    } catch (error) {
      console.error("AppointmentService: Failed to create appointment:", error);
      throw error;
    }
  }

  async cancelAppointment(id: string): Promise<IAppointment> {
    return this.apiService.patch<IAppointment>(`/appointments/${id}/cancel`);
  }

  async rescheduleAppointment(
    id: string,
    newDateTime: Date
  ): Promise<IAppointment> {
    return this.apiService.patch<IAppointment>(
      `/appointments/${id}/reschedule`,
      {
        newDateTime: newDateTime.toISOString(),
      }
    );
  }
}
