import { Response } from "express";
import { AppointmentService } from "../services/AppointmentService";
import { AuditService } from "../services/AuditService";
import { AuthRequest } from "../middleware/auth";

export class AppointmentController {
  private appointmentService: AppointmentService;
  private auditService: AuditService;

  constructor() {
    this.appointmentService = new AppointmentService();
    this.auditService = new AuditService();
  }

  createAppointment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const appointment = await this.appointmentService.create({
        ...req.body,
        patientId:
          req.user!.role === "patient" ? req.user!._id : req.body.patientId,
      });

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "appointment",
        "create",
        req.ip!,
        "success",
        { appointmentId: appointment._id }
      );

      res.status(201).json(appointment);
    } catch (error) {
      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "appointment",
        "create",
        req.ip!,
        "failure",
        { error: (error as Error).message }
      );
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      let appointments;
      const user = req.user!;

      if (user.role === "patient") {
        appointments = await this.appointmentService.getPatientAppointments(
          user._id!.toString()
        );
      } else if (user.role === "doctor") {
        appointments = await this.appointmentService.getDoctorAppointments(
          user._id!.toString()
        );
      } else {
        appointments = await this.appointmentService.getAll(req.query);
      }

      await this.auditService.logAccess(
        user._id!.toString(),
        "appointments",
        "view_list",
        req.ip!,
        "success"
      );

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  };

  cancelAppointment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const appointment = await this.appointmentService.cancelAppointment(
        req.params.id
      );

      if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "appointment",
        "cancel",
        req.ip!,
        "success",
        { appointmentId: req.params.id }
      );

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  };

  rescheduleAppointment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { newDateTime } = req.body;
      const appointment = await this.appointmentService.rescheduleAppointment(
        req.params.id,
        new Date(newDateTime)
      );

      if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }

      await this.auditService.logAccess(
        req.user!._id!.toString(),
        "appointment",
        "reschedule",
        req.ip!,
        "success",
        { appointmentId: req.params.id }
      );

      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
