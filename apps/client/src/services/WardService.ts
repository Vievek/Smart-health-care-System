import { IWard, IBed } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IWardService {
  getWards(): Promise<IWard[]>;
  getAvailableBeds(wardType?: string): Promise<IBed[]>;
  allocateBed(bedId: string, patientId: string): Promise<IBed>;
  transferPatient(currentBedId: string, newBedId: string): Promise<IBed>;
  dischargePatient(bedId: string): Promise<IBed>;
}

export class WardService implements IWardService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getWards(): Promise<IWard[]> {
    return this.apiService.get<IWard[]>("/wards");
  }

  async getAvailableBeds(wardType?: string): Promise<IBed[]> {
    const params = wardType ? { wardType } : undefined;
    return this.apiService.get<IBed[]>("/wards/beds/available", params);
  }

  async allocateBed(bedId: string, patientId: string): Promise<IBed> {
    return this.apiService.post<IBed>("/wards/beds/allocate", {
      bedId,
      patientId,
    });
  }

  async transferPatient(currentBedId: string, newBedId: string): Promise<IBed> {
    return this.apiService.post<IBed>("/wards/beds/transfer", {
      currentBedId,
      newBedId,
    });
  }

  async dischargePatient(bedId: string): Promise<IBed> {
    return this.apiService.post<IBed>("/wards/beds/discharge", { bedId });
  }
}
