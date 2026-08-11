import { priorityFromBackend, priorityToBackend } from "./priority";
import type {
  ChecklistItemType,
  ChecklistTemplate,
  ChecklistTemplateDetail,
  ChecklistTemplateItem,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
} from "./types";

type BackendTemplateItem = {
  id?: string;
  title: string;
  description?: string;
  notes?: string;
  itemType?: string;
  category?: string;
  required?: boolean;
  quantity?: number;
  unit?: string;
  priority?: number;
  position?: number;
};

type BackendTemplate = Record<string, unknown> & {
  items?: BackendTemplateItem[];
};

function itemTypeToBackend(type: ChecklistItemType | undefined): string {
  switch (type) {
    case "task":
      return "task";
    case "quantity":
    case "standard":
    case "note":
    default:
      return "item";
  }
}

export function itemTypeFromBackend(type: unknown, quantity?: number): ChecklistItemType {
  if (type === "task") return "task";
  if (quantity !== undefined && quantity > 0) return "quantity";
  return "standard";
}

export function toBackendTemplateItem(
  item: Partial<ChecklistTemplateItem> & { title: string },
): BackendTemplateItem {
  const out: BackendTemplateItem = {
    title: item.title,
    itemType: itemTypeToBackend(item.itemType),
    required: item.required ?? false,
    priority: priorityToBackend(item.priority),
    position: item.position ?? 0,
  };
  if (item.id) out.id = item.id;
  if (item.category) out.category = item.category;
  if (item.quantity !== undefined) out.quantity = item.quantity;
  if (item.unit) out.unit = item.unit;
  if (item.notes) out.description = item.notes;
  return out;
}

function fromBackendTemplateItem(raw: BackendTemplateItem): ChecklistTemplateItem {
  return {
    id: raw.id ?? "",
    title: raw.title,
    itemType: itemTypeFromBackend(raw.itemType, raw.quantity),
    required: raw.required ?? false,
    priority: priorityFromBackend(raw.priority),
    position: raw.position ?? 0,
    ...(raw.category ? { category: raw.category } : {}),
    ...(raw.quantity !== undefined ? { quantity: raw.quantity } : {}),
    ...(raw.unit ? { unit: raw.unit } : {}),
    ...(raw.description ? { notes: raw.description } : {}),
  };
}

export function fromBackendTemplate(raw: BackendTemplate): ChecklistTemplate {
  const items = raw.items ?? [];
  const requiredItemCount = items.filter((i) => i.required).length;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    category: (raw.category as ChecklistTemplate["category"]) ?? "personal",
    itemCount: items.length,
    requiredItemCount,
    usageCount: Number(raw.usageCount ?? 0),
    favorite: Boolean(raw.isFavorite ?? raw.favorite),
    archived: Boolean(raw.isArchived ?? raw.archived),
    version: Number(raw.version ?? 1),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
    ...(raw.description ? { description: String(raw.description) } : {}),
    ...(raw.estimatedMinutes !== undefined
      ? { estimatedMinutes: Number(raw.estimatedMinutes) }
      : {}),
    ...(raw.lastUsedAt ? { lastUsedAt: String(raw.lastUsedAt) } : {}),
  };
}

export function fromBackendTemplateDetail(raw: BackendTemplate): ChecklistTemplateDetail {
  const base = fromBackendTemplate(raw);
  const items = (raw.items ?? []).map(fromBackendTemplateItem);
  return { ...base, items };
}

export function toBackendCreateTemplateInput(
  input: CreateChecklistTemplateInput,
): Record<string, unknown> {
  return {
    name: input.name,
    category: input.category,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
    ...(input.items?.length
      ? { items: input.items.map((item) => toBackendTemplateItem(item)) }
      : {}),
  };
}

export function toBackendUpdateTemplateInput(
  input: UpdateChecklistTemplateInput,
): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
    ...(input.favorite !== undefined ? { isFavorite: input.favorite } : {}),
    ...(input.items?.length
      ? { items: input.items.map((item) => toBackendTemplateItem(item)) }
      : {}),
  };
}
