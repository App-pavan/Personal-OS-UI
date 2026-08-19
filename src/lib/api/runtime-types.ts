export type RuntimeLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type RuntimeLogEvent = {
  id: string;
  timestamp: string;
  level: RuntimeLogLevel;
  service: string;
  module?: string;
  operation?: string;
  event: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  jobId?: string;
  userId?: string;
  provider?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: { name?: string; message?: string; code?: string };
};

export type RuntimeOperationStatus = "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type RuntimeOperation = {
  operationId: string;
  type: string;
  status: RuntimeOperationStatus;
  currentStep?: string;
  progress?: number;
  correlationId?: string;
  jobId?: string;
  userId?: string;
  service?: string;
  module?: string;
  provider?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: { name?: string; message?: string; code?: string };
};

export type RuntimeLogsResponse = {
  logs: RuntimeLogEvent[];
  count: number;
  retentionMinutes: number;
};

export type RuntimeOperationsResponse = {
  operations: RuntimeOperation[];
  count: number;
  retentionMinutes: number;
};

export type RuntimeLogFilter = {
  level?: string;
  service?: string;
  module?: string;
  operation?: string;
  correlationId?: string;
  jobId?: string;
  userId?: string;
  provider?: string;
  since?: string;
  until?: string;
  limit?: number;
};
