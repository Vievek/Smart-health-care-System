import { Response } from "express";
import { WardService } from "../services/WardService";
import { AuditService } from "../services/AuditService";
import { AuthRequest } from "../middleware/auth";

export class WardController {
  private wardService: WardService;
  private auditService: AuditService;

  constructor() {
    this.wardService = new WardService();
    this.auditService = new AuditService();
  }

  allocateBed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bedId, patientId } = req.body;
      const bed = await this.wardService.allocateBed(bedId, patientId);

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "bed",
        "allocate",
        req.ip!,
        "success",
        { bedId, patientId }
      );

      res.json(bed);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "bed",
        "allocate",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(400).json({ error: (error as Error).message });
    }
  };

  transferPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentBedId, newBedId } = req.body;
      const bed = await this.wardService.transferPatient(
        currentBedId,
        newBedId
      );

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "bed",
        "transfer",
        req.ip!,
        "success",
        { currentBedId, newBedId }
      );

      res.json(bed);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  dischargePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bedId } = req.body;
      const bed = await this.wardService.dischargePatient(bedId);

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "bed",
        "discharge",
        req.ip!,
        "success",
        { bedId }
      );

      res.json(bed);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAvailableBeds = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { wardType } = req.query;
      const beds = await this.wardService.getAvailableBeds(wardType as string);
      res.json(beds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available beds" });
    }
  };

  getWards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const wards = await this.wardService.getAll(req.query);
      res.json(wards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wards" });
    }
  };

  getBedsByWard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { wardId } = req.params;
      const beds = await this.wardService.getBedsByWard(wardId);
      res.json(beds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch beds" });
    }
  };

  getBedsByPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const beds = await this.wardService.getBedsByPatient(patientId);
      res.json(beds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient beds" });
    }
  };

  // Fixed: Remove unused 'req' parameter or prefix with underscore
  getAllBeds = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const beds = await this.wardService.getAllBeds();
      res.json(beds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all beds" });
    }
  };

  createWard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ward = await this.wardService.create(req.body);
      res.status(201).json(ward);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
