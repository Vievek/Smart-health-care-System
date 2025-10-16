import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "@shared/healthcare-types";

const auditLogSchema = new Schema<IAuditLog>({
  actorId: {
    type: String,
    required: true,
  },
  action: { type: String, required: true },
  targetId: { type: String, required: true },
  targetType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, required: true },
  userAgent: String,
  details: Schema.Types.Mixed,
  status: { type: String, enum: ["success", "failure"], required: true },
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
