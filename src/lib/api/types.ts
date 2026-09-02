/* ---------------------------------------------------------------
 * Personal OS — backend DTOs.
 * These mirror the /api/v1 contract exactly. Nothing here is
 * invented for the UI: if a field is not in the backend, it is
 * not in this file.
 * ------------------------------------------------------------- */

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

/* ---------------- Tasks / Action engine ---------------- */

export type TaskStatus =
  | "draft"
  | "inbox"
  | "scheduled"
  | "ready"
  | "in_progress"
  | "waiting"
  | "blocked"
  | "delegated"
  | "completed"
  | "cancelled"
  | "archived";

export type TaskType =
  | "personal"
  | "family"
  | "project"
  | "shopping"
  | "reminder"
  | "automation"
  | "maintenance"
  | "health"
  | "travel"
  | "finance"
  | "system"
  | "ai"
  | "custom";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type EntityLink = {
  entityType: string;
  entityId: string;
  label: string;
};

export type TaskSubtask = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export type TaskChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
  position: number;
};

export type TaskDependency = {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  type: "blocks" | "blocked_by";
};

export type TaskAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type TaskLinkRef = {
  id: string;
  url: string;
  title?: string;
};

export type TaskReminder = {
  id: string;
  remindAt: string;
  channel: "push" | "email" | "in_app";
  sent: boolean;
};

export type TaskComment = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type TaskActivity = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  actorName?: string;
};

export type TaskRecurrence = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  byWeekday?: number[];
  until?: string;
};

export type TaskAiContext = {
  summary?: string;
  suggestedWindow?: string;
  confidence?: number;
  signals?: string[];
};

export type TaskSummary = {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueAt?: string;
  startAt?: string;
  completedAt?: string;
  archivedAt?: string;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  tags: string[];
  labels: string[];
  projectName?: string;
  assigneeName?: string;
  subtaskCount: number;
  subtaskCompletedCount: number;
  checklistItemCount: number;
  commentCount: number;
  attachmentCount: number;
  dependencyCount: number;
  hasReminder: boolean;
  recurrence?: TaskRecurrence;
  createdAt: string;
  updatedAt: string;
};

export type TaskDetail = TaskSummary & {
  description?: string;
  subtasks: TaskSubtask[];
  checklist: TaskChecklistItem[];
  dependencies: TaskDependency[];
  attachments: TaskAttachment[];
  links: TaskLinkRef[];
  reminders: TaskReminder[];
  comments: TaskComment[];
  timeline: TaskActivity[];
  entityLinks: EntityLink[];
  aiContext?: TaskAiContext;
};

export type TaskListQuery = {
  page?: number;
  perPage?: number;
  status?: TaskStatus[];
  type?: TaskType[];
  priority?: TaskPriority[];
  search?: string;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  dueBefore?: string;
  dueAfter?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string;
  startAt?: string;
  tags?: string[];
};

export type UpdateTaskInput = Partial<
  Pick<
    TaskDetail,
    | "title"
    | "description"
    | "type"
    | "status"
    | "priority"
    | "dueAt"
    | "startAt"
    | "progress"
    | "tags"
    | "labels"
  >
>;

export type BulkTaskOperation = {
  ids: string[];
  action: "complete" | "reopen" | "archive" | "restore" | "delete";
};

/* ---------------- Checklists ---------------- */

export type ChecklistCategory =
  | "travel"
  | "family"
  | "home"
  | "work"
  | "health"
  | "shopping"
  | "emergency"
  | "personal"
  | "projects";

export type ChecklistItemType = "standard" | "quantity" | "task" | "note";

export type ChecklistTemplateItem = {
  id: string;
  title: string;
  notes?: string;
  itemType: ChecklistItemType;
  category?: string;
  required: boolean;
  quantity?: number;
  unit?: string;
  priority: TaskPriority;
  position: number;
  assigneeName?: string;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  description?: string;
  category: ChecklistCategory;
  itemCount: number;
  requiredItemCount: number;
  usageCount: number;
  lastUsedAt?: string;
  favorite: boolean;
  archived: boolean;
  estimatedMinutes?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistTemplateDetail = ChecklistTemplate & {
  items: ChecklistTemplateItem[];
};

export type ChecklistInstanceStatus = "active" | "completed" | "cancelled";

export type ChecklistInstanceItem = {
  id: string;
  templateItemId: string;
  title: string;
  notes?: string;
  itemType: ChecklistItemType;
  category?: string;
  required: boolean;
  quantity?: number;
  unit?: string;
  completed: boolean;
  completedAt?: string;
  completedByName?: string;
  assigneeName?: string;
  linkedTaskId?: string;
  position: number;
};

export type ChecklistInstanceEvent = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  actorName?: string;
};

export type ChecklistInstance = {
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  name: string;
  destination?: string;
  status: ChecklistInstanceStatus;
  startDate?: string;
  endDate?: string;
  itemCount: number;
  completedCount: number;
  requiredCount: number;
  requiredCompletedCount: number;
  createdAt: string;
  completedAt?: string;
};

export type ChecklistInstanceDetail = ChecklistInstance & {
  items: ChecklistInstanceItem[];
  history: ChecklistInstanceEvent[];
};

export type CreateChecklistInstanceInput = {
  templateId: string;
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
};

export type CreateChecklistTemplateInput = {
  name: string;
  description?: string;
  category: ChecklistCategory;
  estimatedMinutes?: number;
  items?: Omit<ChecklistTemplateItem, "id">[];
};

export type UpdateChecklistTemplateInput = Partial<CreateChecklistTemplateInput> & {
  favorite?: boolean;
};
