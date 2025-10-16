import { AuditLog } from "../models/AuditLog";
import { BaseRepository } from "../core/base/BaseRepository";
import { IAuditLog } from "@shared/healthcare-types";

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }
}
