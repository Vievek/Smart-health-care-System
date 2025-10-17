import { IWard, IBed } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IWardService {
  getWards(): Promise<IWard[]>;
  getAvailableBeds(wardType?: string): Promise<IBed[]>;
  getAllBeds(): Promise<IBed[]>;
  getBedsByWard(wardId: string): Promise<IBed[]>;
  getBedsByPatient(patientId: string): Promise<IBed[]>;
  allocateBed(bedId: string, patientId: string): Promise<IBed>;
  transferPatient(currentBedId: string, newBedId: string): Promise<IBed>;
  dischargePatient(bedId: string): Promise<IBed>;
  createWard(data: any): Promise<IWard>;
}

export class WardService implements IWardService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getWards(): Promise<IWard[]> {
    try {
      const wards = await this.apiService.get<IWard[]>("/wards");
      console.log("WardService: Loaded wards:", wards.length);
      return wards;
    } catch (error) {
      console.error("WardService: Failed to load wards:", error);
      throw error;
    }
  }

  async getAvailableBeds(wardType?: string): Promise<IBed[]> {
    try {
      const params = wardType ? { wardType } : undefined;
      const beds = await this.apiService.get<IBed[]>(
        "/wards/beds/available",
        params
      );
      console.log("WardService: Loaded available beds:", beds.length);
      return beds;
    } catch (error) {
      console.error("WardService: Failed to load available beds:", error);
      throw error;
    }
  }

  async getAllBeds(): Promise<IBed[]> {
    try {
      const beds = await this.apiService.get<IBed[]>("/wards/beds");
      console.log("WardService: Loaded all beds:", beds.length);
      return beds;
    } catch (error) {
      console.error("WardService: Failed to load all beds:", error);
      throw error;
    }
  }

  async getBedsByWard(wardId: string): Promise<IBed[]> {
    try {
      const beds = await this.apiService.get<IBed[]>(
        `/wards/beds/ward/${wardId}`
      );
      console.log("WardService: Loaded beds for ward:", wardId, beds.length);
      return beds;
    } catch (error) {
      console.error("WardService: Failed to load beds by ward:", error);
      throw error;
    }
  }

  async getBedsByPatient(patientId: string): Promise<IBed[]> {
    try {
      const beds = await this.apiService.get<IBed[]>(
        `/wards/beds/patient/${patientId}`
      );
      console.log(
        "WardService: Loaded beds for patient:",
        patientId,
        beds.length
      );
      return beds;
    } catch (error) {
      console.error("WardService: Failed to load beds by patient:", error);
      throw error;
    }
  }

  async allocateBed(bedId: string, patientId: string): Promise<IBed> {
    try {
      const result = await this.apiService.post<IBed>("/wards/beds/allocate", {
        bedId,
        patientId,
      });
      console.log("WardService: Bed allocated successfully");
      return result;
    } catch (error) {
      console.error("WardService: Failed to allocate bed:", error);
      throw error;
    }
  }

  async transferPatient(currentBedId: string, newBedId: string): Promise<IBed> {
    try {
      const result = await this.apiService.post<IBed>("/wards/beds/transfer", {
        currentBedId,
        newBedId,
      });
      console.log("WardService: Patient transferred successfully");
      return result;
    } catch (error) {
      console.error("WardService: Failed to transfer patient:", error);
      throw error;
    }
  }

  async dischargePatient(bedId: string): Promise<IBed> {
    try {
      const result = await this.apiService.post<IBed>("/wards/beds/discharge", {
        bedId,
      });
      console.log("WardService: Patient discharged successfully");
      return result;
    } catch (error) {
      console.error("WardService: Failed to discharge patient:", error);
      throw error;
    }
  }

  async createWard(data: any): Promise<IWard> {
    try {
      const result = await this.apiService.post<IWard>("/wards", data);
      console.log("WardService: Ward created successfully");
      return result;
    } catch (error) {
      console.error("WardService: Failed to create ward:", error);
      throw error;
    }
  }
}
