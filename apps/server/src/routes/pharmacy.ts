import { Router } from "express";
import { PharmacyController } from "../controllers/PharmacyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const pharmacyController = new PharmacyController();

router.get("/inventory", authenticate, pharmacyController.getInventory);
router.get(
  "/inventory/low-stock",
  authenticate,
  authorize("pharmacist", "admin"),
  pharmacyController.getLowStockItems
);
router.post(
  "/dispense",
  authenticate,
  authorize("pharmacist"),
  pharmacyController.dispenseMedication
);
router.post(
  "/check-interactions",
  authenticate,
  pharmacyController.checkDrugInteractions
);

export { router as pharmacyRoutes };
