export interface AuditLogEvent {
  action: "create" | "update" | "delete";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changes?: any;
}

export interface AuditLogActor {
  userId: string;
  username: string;
  roles: string[];
}

export interface AuditLog {
  _id: string;
  event: AuditLogEvent;
  actor: AuditLogActor;
  source: string;
  description: string;
  timestamp: Date;
}

export interface AuditLogStatistics {
  actionStats: { _id: string; count: number }[];
  sourceStats: { _id: string; count: number }[];
  recentActivity: AuditLog[];
}

export interface AuditLogPaginatedResponse {
  logs: AuditLog[];
  currentPage: number;
  limitNumber: number;
  totalPages: number;
  totalLogs: number;
}

export interface AuditLogSources {
  sources: string[];
  count: number;
}
