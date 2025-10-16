import { Response } from "express";
import { MedicalRecordService } from "../services/MedicalRecordService";
import { AuditService } from "../services/AuditService";
import { AuthRequest } from "../middleware/auth";

export class MedicalRecordController {
  private medicalRecordService: MedicalRecordService;
  private auditService: AuditService;

  constructor() {
    this.medicalRecordService = new MedicalRecordService();
    this.auditService = new AuditService();
  }

  getRecords = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.query;
      const user = req.user!;

      let records;
      if (user.role === "patient") {
        records = await this.medicalRecordService.getPatientRecords(
          user._id!.toString(),
          user.role
        );
      } else if (patientId) {
        records = await this.medicalRecordService.getPatientRecords(
          patientId as string,
          user.role
        );
      } else {
        records = await this.medicalRecordService.getAll(req.query);
      }

      await this.auditService.logAccess(
        user._id!.toString(),
        "medical_records",
        "view_list",
        req.ip!,
        "success"
      );

      res.json(records);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "medical_records",
        "view_list",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(500).json({ error: "Failed to fetch medical records" });
    }
  };

  getRecordById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const record = await this.medicalRecordService.getById(req.params.id);

      if (!record) {
        res.status(404).json({ error: "Record not found" });
        return;
      }

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "medical_record",
        "view",
        req.ip!,
        "success",
        { recordId: req.params.id }
      );

      res.json(record);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "medical_record",
        "view",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(500).json({ error: "Failed to fetch medical record" });
    }
  };

  downloadRecordPDF = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const pdfBuffer = await this.medicalRecordService.generateRecordPDF(
        req.params.id
      );

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "medical_record",
        "download_pdf",
        req.ip!,
        "success",
        { recordId: req.params.id }
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=record-${req.params.id}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "medical_record",
        "download_pdf",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  };

  createPrescription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const prescription = await this.medicalRecordService.createPrescription({
        ...req.body,
        authorId: req.user!._id,
      });

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "prescription",
        "create",
        req.ip!,
        "success",
        { prescriptionId: prescription._id }
      );

      res.status(201).json(prescription);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "prescription",
        "create",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(500).json({ error: "Failed to create prescription" });
    }
  };
}
