import { IAuditLog } from '@shared/healthcare-types'
import { AuditLogRepository } from '../repositories/AuditLogRepository'

export class AuditService {
  constructor(private auditRepo: AuditLogRepository = new AuditLogRepository()) {}

  async logAccess(
    actorId: string,
    targetType: string,
    action: string,
    ipAddress: string,
    status: 'success' | 'failure',
    details?: any
  ): Promise<IAuditLog> {
    // Extract real targetId from details if provided, otherwise fallback to "system"
    let targetId = 'system'
    if (details) {
      targetId =
        details.recordId ||
        details.patientId ||
        details.appointmentId ||
        details.prescriptionId ||
        details.wardId ||
        details.bedId ||
        details.targetId ||
        'system'
    }

    return this.auditRepo.create({
      actorId,
      targetType,
      action,
      targetId,
      ipAddress,
      status,
      details,
      timestamp: new Date(),
    })
  }

  async getAccessLogs(userId?: string): Promise<IAuditLog[]> {
    const filter = userId ? { actorId: userId } : {}
    return this.auditRepo.findAll(filter)
  }
}
