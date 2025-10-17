import { IMedicalRecord } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IMedicalRecordService {
  getRecords(patientId?: string): Promise<IMedicalRecord[]>;
  getRecordById(id: string): Promise<IMedicalRecord>;
  downloadRecordPDF(id: string): Promise<Blob>;
  createPrescription(data: any): Promise<IMedicalRecord>;
  getPrescriptionsByPatient(patientId: string): Promise<IMedicalRecord[]>;
}

export class MedicalRecordService implements IMedicalRecordService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getRecords(patientId?: string): Promise<IMedicalRecord[]> {
    try {
      const params = patientId ? { patientId } : undefined;
      const records = await this.apiService.get<IMedicalRecord[]>(
        "/medical-records",
        params
      );
      console.log("MedicalRecordService: Loaded records:", records.length);
      return records;
    } catch (error) {
      console.error("MedicalRecordService: Failed to load records:", error);
      throw error;
    }
  }

  async getRecordById(id: string): Promise<IMedicalRecord> {
    return this.apiService.get<IMedicalRecord>(`/medical-records/${id}`);
  }

  async downloadRecordPDF(id: string): Promise<Blob> {
    try {
      const response = await fetch(
        `http://localhost:5000/api/medical-records/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error("MedicalRecordService: PDF download failed:", error);
      throw error;
    }
  }

  async createPrescription(data: any): Promise<IMedicalRecord> {
    return this.apiService.post<IMedicalRecord>(
      "/medical-records/prescriptions",
      data
    );
  }

  async getPrescriptionsByPatient(
    patientId: string
  ): Promise<IMedicalRecord[]> {
    try {
      const prescriptions = await this.apiService.get<IMedicalRecord[]>(
        `/medical-records/patient/${patientId}/prescriptions`
      );
      console.log(
        "MedicalRecordService: Loaded prescriptions:",
        prescriptions.length
      );
      return prescriptions;
    } catch (error) {
      console.error(
        "MedicalRecordService: Failed to load prescriptions:",
        error
      );
      throw error;
    }
  }
}
