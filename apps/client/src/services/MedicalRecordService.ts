import { IMedicalRecord } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IMedicalRecordService {
  getRecords(patientId?: string): Promise<IMedicalRecord[]>;
  getRecordById(id: string): Promise<IMedicalRecord>;
  downloadRecordPDF(id: string): Promise<Blob>;
  createPrescription(data: any): Promise<IMedicalRecord>;
}

export class MedicalRecordService implements IMedicalRecordService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getRecords(patientId?: string): Promise<IMedicalRecord[]> {
    const params = patientId ? { patientId } : undefined;
    return this.apiService.get<IMedicalRecord[]>("/medical-records", params);
  }

  async getRecordById(id: string): Promise<IMedicalRecord> {
    return this.apiService.get<IMedicalRecord>(`/medical-records/${id}`);
  }

  async downloadRecordPDF(id: string): Promise<Blob> {
    // For blob responses, we need to handle differently
    const response = await fetch(
      `http://localhost:5000/api/medical-records/${id}/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download PDF");
    }

    return response.blob();
  }

  async createPrescription(data: any): Promise<IMedicalRecord> {
    return this.apiService.post<IMedicalRecord>(
      "/medical-records/prescriptions",
      data
    );
  }
}
