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
    return this.apiService.get<IAppointment[]>("/appointments");
  }

  async createAppointment(data: any): Promise<IAppointment> {
    return this.apiService.post<IAppointment>("/appointments", data);
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
