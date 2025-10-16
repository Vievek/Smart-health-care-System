import { IInventoryItem, IDispenseTransaction } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IPharmacyService {
  getInventory(): Promise<IInventoryItem[]>;
  getLowStockItems(): Promise<IInventoryItem[]>;
  dispenseMedication(data: any): Promise<IDispenseTransaction>;
  checkDrugInteractions(
    patientId: string,
    medications: string[]
  ): Promise<string[]>;
}

export class PharmacyService implements IPharmacyService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getInventory(): Promise<IInventoryItem[]> {
    return this.apiService.get<IInventoryItem[]>("/pharmacy/inventory");
  }

  async getLowStockItems(): Promise<IInventoryItem[]> {
    return this.apiService.get<IInventoryItem[]>(
      "/pharmacy/inventory/low-stock"
    );
  }

  async dispenseMedication(data: any): Promise<IDispenseTransaction> {
    return this.apiService.post<IDispenseTransaction>(
      "/pharmacy/dispense",
      data
    );
  }

  async checkDrugInteractions(
    patientId: string,
    medications: string[]
  ): Promise<string[]> {
    const response = await this.apiService.post<{ interactions: string[] }>(
      "/pharmacy/check-interactions",
      { patientId, medications }
    );
    return response.interactions;
  }
}
