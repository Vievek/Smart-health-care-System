import { Router } from "express";
import { WardController } from "../controllers/WardController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const wardController = new WardController();

router.get("/", authenticate, wardController.getWards);
router.get("/beds/available", authenticate, wardController.getAvailableBeds);
router.post(
  "/beds/allocate",
  authenticate,
  authorize("nurse", "ward_clerk", "admin"),
  wardController.allocateBed
);
router.post(
  "/beds/transfer",
  authenticate,
  authorize("nurse", "ward_clerk", "admin"),
  wardController.transferPatient
);
router.post(
  "/beds/discharge",
  authenticate,
  authorize("nurse", "ward_clerk", "admin"),
  wardController.dischargePatient
);

export { router as wardRoutes };
