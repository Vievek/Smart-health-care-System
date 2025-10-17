import { IMedicalRecord, MedicalRecordType } from "@shared/healthcare-types";
import { MedicalRecordRepository } from "../repositories/MedicalRecordRepository";
import { IService } from "../core/interfaces/IService";
import PDFDocument from "pdfkit";

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
    userRole: string
  ): Promise<IMedicalRecord[]> {
    console.log(`Getting records for patient: ${patientId}, role: ${userRole}`);

    // For patients, only return their own records
    if (userRole === "patient") {
      const records = await this.medicalRecordRepo.findByPatientId(patientId);
      console.log(`Found ${records.length} records for patient ${patientId}`);
      return records;
    }
    // For doctors and other roles, return patient records
    else if (userRole === "doctor" || userRole === "pharmacist") {
      const records = await this.medicalRecordRepo.findByPatientId(patientId);
      console.log(
        `Found ${records.length} records for patient ${patientId} (viewed by ${userRole})`
      );
      return records;
    }

    // Default fallback
    return this.medicalRecordRepo.findByPatientId(patientId);
  }

  async getRecordsByDoctor(doctorId: string): Promise<IMedicalRecord[]> {
    return this.medicalRecordRepo.findByDoctorId(doctorId);
  }

  async createPrescription(prescriptionData: any): Promise<IMedicalRecord> {
    return this.create({
      ...prescriptionData,
      recordType: MedicalRecordType.PRESCRIPTION,
      title: `Prescription - ${new Date().toLocaleDateString()}`,
    });
  }

  async getPrescriptionsByPatient(
    patientId: string
  ): Promise<IMedicalRecord[]> {
    console.log(`Getting prescriptions for patient: ${patientId}`);
    try {
      const prescriptions =
        await this.medicalRecordRepo.findPrescriptionsByPatient(patientId);
      console.log(
        `Found ${prescriptions.length} prescriptions for patient ${patientId}`
      );
      return prescriptions;
    } catch (error) {
      console.error(
        `Error getting prescriptions for patient ${patientId}:`,
        error
      );
      throw error;
    }
  }

  async generateRecordPDF(recordId: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const record = await this.getById(recordId);
        if (!record) {
          throw new Error("Record not found");
        }

        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add content to PDF
        doc.fontSize(20).text("Medical Record", { align: "center" });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Patient ID: ${record.patientId}`);
        doc.text(`Record Type: ${record.recordType}`);
        doc.text(`Title: ${record.title}`);
        doc.text(
          `Created Date: ${new Date(record.createdDate).toLocaleDateString()}`
        );
        doc.text(`Author ID: ${record.authorId}`);

        if (record.description) {
          doc.moveDown();
          doc.text(`Description: ${record.description}`);
        }

        if (record.prescription) {
          doc.moveDown();
          doc.text("Prescription Details:");
          record.prescription.medications.forEach((med, index) => {
            doc.text(
              `${index + 1}. ${med.name} - ${med.dosage} (${
                med.frequency
              }) for ${med.duration}`
            );
          });
        }

        if (record.labResults) {
          doc.moveDown();
          doc.text("Lab Results:");
          Object.entries(record.labResults.results).forEach(([key, value]) => {
            doc.text(`${key}: ${value} ${record.labResults?.units[key] || ""}`);
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
