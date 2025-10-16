import { MedicalRecord } from "../models/MedicalRecord";
import { BaseRepository } from "../core/base/BaseRepository";
import { IMedicalRecord } from "@shared/healthcare-types";

export class MedicalRecordRepository extends BaseRepository<IMedicalRecord> {
  constructor() {
    super(MedicalRecord);
  }

  async findByPatientId(patientId: string): Promise<IMedicalRecord[]> {
    const results = await this.model
      .find({ patientId })
      .sort({ createdDate: -1 });
    return results.map((result: any) => result._doc);
  }

  async findByDoctorId(doctorId: string): Promise<IMedicalRecord[]> {
    const results = await this.model
      .find({ authorId: doctorId })
      .sort({ createdDate: -1 });
    return results.map((result: any) => result._doc);
  }

  async findPrescriptionsByPatient(
    patientId: string
  ): Promise<IMedicalRecord[]> {
    const results = await this.model.find({
      patientId,
      recordType: "prescription",
      "prescription.status": "active",
    });
    return results.map((result: any) => result._doc);
  }
}
