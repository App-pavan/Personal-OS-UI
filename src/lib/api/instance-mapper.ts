import { itemTypeFromBackend } from "./checklist-mapper";
import type {
  ChecklistInstance,
  ChecklistInstanceDetail,
  ChecklistInstanceItem,
  ChecklistInstanceStatus,
  CreateChecklistInstanceInput,
} from "./types";

type BackendProgress = {
  totalItems?: number;
  completedItems?: number;
  requiredItems?: number;
  completedRequiredItems?: number;
};

type BackendInstanceItem = {
  templateItemId: string;
  title: string;
  description?: string;
  notes?: string;
  itemType?: string;
  category?: string;
  required?: boolean;
  quantity?: number;
  unit?: string;
  checked?: boolean;
  checkedAt?: string;
  checkedBy?: string;
  assignedTo?: string;
  taskId?: string;
  position?: number;
};

type BackendInstance = Record<string, unknown> & {
  items?: BackendInstanceItem[];
  progress?: BackendProgress;
};

function statusFromBackend(status: unknown): ChecklistInstanceStatus {
  const value = String(status ?? "");
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "active";
}

function fromBackendInstanceItem(raw: BackendInstanceItem): ChecklistInstanceItem {
  return {
    id: raw.templateItemId,
    templateItemId: raw.templateItemId,
    title: raw.title,
    itemType: itemTypeFromBackend(raw.itemType, raw.quantity),
    required: raw.required ?? false,
    completed: Boolean(raw.checked),
    position: raw.position ?? 0,
    ...(raw.category ? { category: raw.category } : {}),
    ...(raw.quantity !== undefined ? { quantity: raw.quantity } : {}),
    ...(raw.unit ? { unit: raw.unit } : {}),
    ...(raw.description || raw.notes ? { notes: raw.description ?? raw.notes } : {}),
    ...(raw.checkedAt ? { completedAt: raw.checkedAt } : {}),
    ...(raw.assignedTo ? { assigneeName: raw.assignedTo } : {}),
    ...(raw.taskId ? { linkedTaskId: raw.taskId } : {}),
  };
}

export function fromBackendInstance(raw: BackendInstance): ChecklistInstance {
  const items = raw.items ?? [];
  const progress = raw.progress ?? {};
  const itemCount = progress.totalItems ?? items.length;
  const completedCount = progress.completedItems ?? items.filter((i) => i.checked).length;
  const requiredCount = progress.requiredItems ?? items.filter((i) => i.required).length;
  const requiredCompletedCount =
    progress.completedRequiredItems ?? items.filter((i) => i.required && i.checked).length;

  return {
    id: String(raw["id"] ?? ""),
    templateId: String(raw["templateId"] ?? ""),
    templateName: String(raw["templateName"] ?? raw["name"] ?? ""),
    templateVersion: Number(raw["templateVersion"] ?? 1),
    name: String(raw["name"] ?? ""),
    status: statusFromBackend(raw["status"]),
    itemCount,
    completedCount,
    requiredCount,
    requiredCompletedCount,
    createdAt: String(raw["createdAt"] ?? ""),
    ...(raw["destination"] ? { destination: String(raw["destination"]) } : {}),
    ...(raw["startDate"] ? { startDate: String(raw["startDate"]) } : {}),
    ...(raw["endDate"] ? { endDate: String(raw["endDate"]) } : {}),
    ...(raw["completedAt"] ? { completedAt: String(raw["completedAt"]) } : {}),
  };
}

export function fromBackendInstanceDetail(raw: BackendInstance): ChecklistInstanceDetail {
  const items = (raw.items ?? []).map(fromBackendInstanceItem);
  return {
    ...fromBackendInstance({ ...raw, items }),
    items,
    history: [],
  };
}

export function toBackendCreateInstanceInput(
  input: CreateChecklistInstanceInput,
): Record<string, unknown> {
  return {
    templateId: input.templateId,
    name: input.name,
    ...(input.destination ? { destination: input.destination } : {}),
    ...(input.startDate ? { startDate: input.startDate } : {}),
    ...(input.endDate ? { endDate: input.endDate } : {}),
  };
}
