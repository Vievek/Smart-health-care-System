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
    try {
      const inventory = await this.apiService.get<IInventoryItem[]>(
        "/pharmacy/inventory"
      );
      console.log("PharmacyService: Loaded inventory:", inventory.length);
      return inventory;
    } catch (error) {
      console.error("PharmacyService: Failed to load inventory:", error);
      throw error;
    }
  }

  async getLowStockItems(): Promise<IInventoryItem[]> {
    try {
      const lowStock = await this.apiService.get<IInventoryItem[]>(
        "/pharmacy/inventory/low-stock"
      );
      console.log("PharmacyService: Loaded low stock items:", lowStock.length);
      return lowStock;
    } catch (error) {
      console.error("PharmacyService: Failed to load low stock items:", error);
      throw error;
    }
  }

  async dispenseMedication(data: any): Promise<IDispenseTransaction> {
    try {
      const result = await this.apiService.post<IDispenseTransaction>(
        "/pharmacy/dispense",
        data
      );
      console.log("PharmacyService: Medication dispensed successfully");
      return result;
    } catch (error) {
      console.error("PharmacyService: Failed to dispense medication:", error);
      throw error;
    }
  }

  async checkDrugInteractions(
    patientId: string,
    medications: string[]
  ): Promise<string[]> {
    try {
      const response = await this.apiService.post<{ interactions: string[] }>(
        "/pharmacy/check-interactions",
        { patientId, medications }
      );
      return response.interactions;
    } catch (error) {
      console.error(
        "PharmacyService: Failed to check drug interactions:",
        error
      );
      throw error;
    }
  }
}
