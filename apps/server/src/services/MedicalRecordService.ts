import { IMedicalRecord } from "@shared/healthcare-types";
import { MedicalRecordRepository } from "../repositories/MedicalRecordRepository";
import { IService } from "../core/interfaces/IService";

export class MedicalRecordService implements IService<IMedicalRecord> {
  constructor(
    private medicalRecordRepo: MedicalRecordRepository = new MedicalRecordRepository()
  ) {}

  async getById(id: string): Promise<IMedicalRecord | null> {
    return this.medicalRecordRepo.findById(id);
  }

  async getAll(filter?: any): Promise<IMedicalRecord[]> {
    return this.medicalRecordRepo.findAll(filter);
  }

  async create(data: Partial<IMedicalRecord>): Promise<IMedicalRecord> {
    return this.medicalRecordRepo.create(data);
  }

  async update(
    id: string,
    data: Partial<IMedicalRecord>
  ): Promise<IMedicalRecord | null> {
    return this.medicalRecordRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.medicalRecordRepo.delete(id);
  }

  async getPatientRecords(
    patientId: string,
    _userRole: string // Prefix with underscore to indicate unused parameter
  ): Promise<IMedicalRecord[]> {
    // Authorization logic based on role would be implemented here
    return this.medicalRecordRepo.findByPatientId(patientId);
  }

  async getRecordsByDoctor(doctorId: string): Promise<IMedicalRecord[]> {
    return this.medicalRecordRepo.findByDoctorId(doctorId);
  }

  async createPrescription(prescriptionData: any): Promise<IMedicalRecord> {
    return this.create({
      ...prescriptionData,
      recordType: "prescription",
      title: `Prescription - ${new Date().toLocaleDateString()}`,
    });
  }

  async generateRecordPDF(recordId: string): Promise<Buffer> {
    // PDF generation logic would be implemented here
    // For now, return a simple buffer
    return Buffer.from(`PDF for record ${recordId}`);
  }
}
