import { IAuditLog } from "@shared/healthcare-types";
import { AuditLogRepository } from "../repositories/AuditLogRepository";

export class AuditService {
  constructor(
    private auditRepo: AuditLogRepository = new AuditLogRepository()
  ) {}

  async logAccess(
    actorId: string,
    targetType: string,
    action: string,
    ipAddress: string,
    status: "success" | "failure",
    details?: any
  ): Promise<IAuditLog> {
    return this.auditRepo.create({
      actorId,
      targetType,
      action,
      targetId: "system", // Would be specific target ID in real implementation
      ipAddress,
      status,
      details,
      timestamp: new Date(),
    });
  }

  async getAccessLogs(userId?: string): Promise<IAuditLog[]> {
    const filter = userId ? { actorId: userId } : {};
    return this.auditRepo.findAll(filter);
  }
}
