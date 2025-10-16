import { Response } from "express";
import { PharmacyService } from "../services/PharmacyService";
import { AuditService } from "../services/AuditService";
import { AuthRequest } from "../middleware/auth";

export class PharmacyController {
  private pharmacyService: PharmacyService;
  private auditService: AuditService;

  constructor() {
    this.pharmacyService = new PharmacyService();
    this.auditService = new AuditService();
  }

  dispenseMedication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const transaction = await this.pharmacyService.dispenseMedication({
        ...req.body,
        pharmacistId: req.user!._id!.toString(),
      });

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "pharmacy",
        "dispense",
        req.ip!,
        "success",
        { transactionId: transaction._id }
      );

      res.status(201).json(transaction);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "pharmacy",
        "dispense",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(400).json({ error: (error as Error).message });
    }
  };

  checkDrugInteractions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { patientId, medications } = req.body;
      const interactions = await this.pharmacyService.checkDrugInteractions(
        patientId,
        medications
      );
      res.json({ interactions });
    } catch (error) {
      res.status(500).json({ error: "Failed to check drug interactions" });
    }
  };

  getInventory = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const inventory = await this.pharmacyService.getAll();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  };

  getLowStockItems = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const lowStockItems = await this.pharmacyService.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  };
}
