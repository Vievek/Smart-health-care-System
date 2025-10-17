import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const appointmentController = new AppointmentController();

router.get("/", authenticate, appointmentController.getAppointments);
router.get("/:id", authenticate, appointmentController.getAppointmentById);
router.post(
  "/",
  authenticate,
  authorize("patient", "admin"),
  appointmentController.createAppointment
);
router.patch(
  "/:id/cancel",
  authenticate,
  appointmentController.cancelAppointment
);
router.patch(
  "/:id/reschedule",
  authenticate,
  appointmentController.rescheduleAppointment
);

export { router as appointmentRoutes };
