import { priorityFromBackend } from "./priority";
import type {
  EntityLink,
  TaskActivity,
  TaskAttachment,
  TaskChecklistItem,
  TaskComment,
  TaskDependency,
  TaskDetail,
  TaskLinkRef,
  TaskPriority,
  TaskReminder,
  TaskStatus,
  TaskSubtask,
  TaskSummary,
  TaskType,
} from "./types";

type Raw = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const num = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : value == null ? fallback : Boolean(value);

const iso = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value) return undefined;
  return value;
};

const asRaw = (value: unknown): Raw => (value && typeof value === "object" ? (value as Raw) : {});

const asList = (value: unknown): Raw[] => (Array.isArray(value) ? value.map(asRaw) : []);

const STATUS: TaskStatus[] = [
  "draft",
  "inbox",
  "scheduled",
  "ready",
  "in_progress",
  "waiting",
  "blocked",
  "delegated",
  "completed",
  "cancelled",
  "archived",
];

const TYPES: TaskType[] = [
  "personal",
  "family",
  "project",
  "shopping",
  "reminder",
  "automation",
  "maintenance",
  "health",
  "travel",
  "finance",
  "system",
  "ai",
  "custom",
];

function normalizeStatus(value: unknown): TaskStatus {
  const s = str(value, "inbox");
  return STATUS.includes(s as TaskStatus) ? (s as TaskStatus) : "inbox";
}

function normalizeType(value: unknown): TaskType {
  const t = str(value, "personal");
  return TYPES.includes(t as TaskType) ? (t as TaskType) : "personal";
}

function normalizeSubtasks(raw: Raw): TaskSubtask[] {
  const explicit = asList(raw.subtasks);
  if (explicit.length) {
    return explicit.map((item, index) => ({
      id: str(item.id, `sub-${index}`),
      title: str(item.title, "Step"),
      completed: bool(item.completed),
      position: num(item.position, index),
    }));
  }
  const childIds = Array.isArray(raw.childIds)
    ? raw.childIds.map((id) => str(id)).filter(Boolean)
    : [];
  return childIds.map((id, index) => ({
    id,
    title: "Subtask",
    completed: false,
    position: index,
  }));
}

function normalizeChecklist(raw: Raw): TaskChecklistItem[] {
  return asList(raw.checklist).map((item, index) => ({
    id: str(item.id, `chk-${index}`),
    title: str(item.title, "Item"),
    completed: bool(item.completed),
    required: bool(item.required),
    position: num(item.position, index),
  }));
}

function normalizeDependencies(raw: Raw): TaskDependency[] {
  return asList(raw.dependencies).map((item, index) => ({
    id: str(item.id, `dep-${index}`),
    taskId: str(item.actionId ?? item.taskId),
    title: str(item.title, "Related task"),
    status: normalizeStatus(item.status),
    type: str(item.type) === "blocks" ? "blocks" : "blocked_by",
  }));
}

function normalizeAttachments(raw: Raw): TaskAttachment[] {
  return asList(raw.attachments).map((item, index) => ({
    id: str(item.id, `att-${index}`),
    filename: str(item.filename ?? item.name, "Attachment"),
    mimeType: str(item.mimeType, "application/octet-stream"),
    size: num(item.size),
    createdAt: iso(item.uploadedAt ?? item.createdAt) ?? new Date().toISOString(),
  }));
}

function normalizeEntityLinks(raw: Raw): EntityLink[] {
  return asList(raw.links).map((item) => ({
    entityType: str(item.kind ?? item.entityType, "link"),
    entityId: str(item.entityId ?? item.id),
    label: str(item.label ?? item.url, "Link"),
    url: str(item.url) || undefined,
  }));
}

function normalizeUrlLinks(raw: Raw): TaskLinkRef[] {
  return asList(raw.links)
    .filter((item) => str(item.url))
    .map((item, index) => ({
      id: str(item.id, `link-${index}`),
      url: str(item.url),
      title: str(item.label ?? item.title) || undefined,
    }));
}

function normalizeComments(raw: Raw): TaskComment[] {
  return asList(raw.comments).map((item, index) => ({
    id: str(item.id, `cmt-${index}`),
    body: str(item.body),
    authorName: str(item.authorName ?? item.authorId, "You"),
    createdAt: iso(item.createdAt) ?? new Date().toISOString(),
  }));
}

function normalizeTimeline(raw: Raw): TaskActivity[] {
  return asList(raw.timeline ?? raw.activities).map((item, index) => ({
    id: str(item.id, `act-${index}`),
    action: str(item.action),
    description: str(item.description ?? item.field, str(item.action)),
    createdAt: iso(item.createdAt) ?? new Date().toISOString(),
    actorName: str(item.actorName ?? item.actorId) || undefined,
  }));
}

function normalizeReminders(raw: Raw): TaskReminder[] {
  return asList(raw.reminders).map((item, index) => ({
    id: str(item.id, `rem-${index}`),
    remindAt: iso(item.at ?? item.remindAt) ?? new Date().toISOString(),
    channel: "in_app",
    sent: bool(item.sent),
  }));
}

/** Map backend action DTO → UI task summary. */
export function normalizeTaskSummary(raw: Raw): TaskSummary {
  return {
    id: str(raw.id),
    title: str(raw.title, "Untitled"),
    type: normalizeType(raw.type),
    status: normalizeStatus(raw.status),
    priority: priorityFromBackend(raw.priority) as TaskPriority,
    progress: num(raw.progress),
    dueAt: iso(raw.dueAt),
    startAt: iso(raw.startAt),
    completedAt: iso(raw.completedAt),
    pinned: bool(raw.pinned),
    favorite: bool(raw.favorite),
    archived: bool(raw.archived) || Boolean(iso(raw.archivedAt)),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => str(t)).filter(Boolean) : [],
    labels: Array.isArray(raw.labels) ? raw.labels.map((t) => str(t)).filter(Boolean) : [],
    projectName: str(raw.projectName ?? raw.category) || undefined,
    assigneeName: str(raw.assigneeName) || undefined,
    subtaskCount: num(raw.subtaskCount, Array.isArray(raw.childIds) ? raw.childIds.length : 0),
    subtaskCompletedCount: num(raw.subtaskCompletedCount),
    checklistItemCount: num(raw.checklistItemCount, asList(raw.checklist).length),
    commentCount: num(raw.commentCount, asList(raw.comments).length),
    attachmentCount: num(raw.attachmentCount, asList(raw.attachments).length),
    dependencyCount: num(raw.dependencyCount, asList(raw.dependencies).length),
    hasReminder: bool(raw.hasReminder) || asList(raw.reminders).length > 0,
    createdAt: iso(raw.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(raw.updatedAt) ?? new Date().toISOString(),
  };
}

/** Map backend action DTO → UI task detail with safe defaults for nested arrays. */
export function normalizeTaskDetail(raw: Raw): TaskDetail {
  return {
    ...normalizeTaskSummary(raw),
    description: str(raw.description) || undefined,
    subtasks: normalizeSubtasks(raw),
    checklist: normalizeChecklist(raw),
    dependencies: normalizeDependencies(raw),
    attachments: normalizeAttachments(raw),
    links: normalizeUrlLinks(raw),
    reminders: normalizeReminders(raw),
    comments: normalizeComments(raw),
    timeline: normalizeTimeline(raw),
    entityLinks: normalizeEntityLinks(raw),
    aiContext:
      raw.aiContext && typeof raw.aiContext === "object"
        ? {
            summary: str(asRaw(raw.aiContext).summary) || undefined,
            suggestedWindow: str(asRaw(raw.aiContext).suggestedWindow) || undefined,
            confidence: num(asRaw(raw.aiContext).confidence, undefined as unknown as number) || undefined,
          }
        : undefined,
  };
}
