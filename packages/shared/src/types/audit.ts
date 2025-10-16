export interface IAuditLog {
  _id?: string;
  actorId: string;
  action: string;
  targetId: string;
  targetType: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: "success" | "failure";
}
