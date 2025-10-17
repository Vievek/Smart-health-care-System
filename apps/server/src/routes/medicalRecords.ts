import { Router } from "express";
import { MedicalRecordController } from "../controllers/MedicalRecordController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const medicalRecordController = new MedicalRecordController();

router.get("/", authenticate, medicalRecordController.getRecords);
router.get("/:id", authenticate, medicalRecordController.getRecordById);
router.get(
  "/:id/download",
  authenticate,
  medicalRecordController.downloadRecordPDF
);
router.get(
  "/patient/:patientId/prescriptions",
  authenticate,
  medicalRecordController.getPrescriptionsByPatient
);
router.post(
  "/prescriptions",
  authenticate,
  authorize("doctor"),
  medicalRecordController.createPrescription
);

export { router as medicalRecordRoutes };
