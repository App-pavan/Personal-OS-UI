/* ---------------------------------------------------------------
 * Universal Personal OS document model.
 *
 * One editor produces many kinds of objects. The document is only
 * the human interface — the backend stays the source of truth, so
 * every serializer below maps blocks onto the real /api/v1 DTOs.
 * ------------------------------------------------------------- */

import type {
  ChecklistCategory,
  ChecklistTemplateDetail,
  ChecklistTemplateItem,
  CreateChecklistTemplateInput,
  CreateTaskInput,
  TaskDetail,
  TaskPriority,
} from "@/lib/api/types";

export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "todo"
  | "check"
  | "bullet"
  | "number"
  | "toggle"
  | "quote"
  | "code"
  | "divider"
  | "date"
  | "link";

export type Block = {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  collapsed?: boolean;
  indent: number;
};

export type EditorDoc = {
  title: string;
  blocks: Block[];
};

export type ObjectKind = "task" | "checklist";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `b_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const block = (type: BlockType = "text", text = "", indent = 0): Block => ({
  id: uid(),
  type,
  text,
  indent,
});

export const emptyDoc = (title = ""): EditorDoc => ({ title, blocks: [block()] });

/** Block types that continue themselves when you press Enter. */
export const CONTINUING: BlockType[] = ["todo", "check", "bullet", "number", "quote"];

/** Block types that turn into checklist / step items when saved. */
const ITEM_TYPES: BlockType[] = ["todo", "check", "bullet", "number"];

export const isItemBlock = (b: Block) => ITEM_TYPES.includes(b.type) && b.text.trim().length > 0;

const isHeading = (b: Block) => b.type === "h1" || b.type === "h2" || b.type === "h3";

export const docIsEmpty = (doc: EditorDoc) =>
  !doc.title.trim() && doc.blocks.every((b) => !b.text.trim() && b.type !== "divider");

/* ---------------- quantity sugar: "3 Shirts" → 3 × Shirts ---------------- */

const QUANTITY = /^(\d{1,4})\s*(x|×)?\s+(.{1,})$/i;

export function splitQuantity(raw: string): { title: string; quantity?: number } {
  const match = QUANTITY.exec(raw.trim());
  if (!match) return { title: raw.trim() };
  const quantity = Number(match[1]);
  const title = (match[3] ?? "").trim();
  if (!title || !Number.isFinite(quantity) || quantity < 1) return { title: raw.trim() };
  return { title, quantity };
}

/* ---------------- checklist template ---------------- */

/**
 * Headings and toggles become item categories; list blocks become
 * items. Free paragraphs before the first item become the
 * description. Nothing invented, nothing lost.
 */
export function docToTemplateInput(
  doc: EditorDoc,
  category: ChecklistCategory = "personal",
): CreateChecklistTemplateInput {
  const items: Omit<ChecklistTemplateItem, "id">[] = [];
  const intro: string[] = [];
  let group: string | undefined;
  let seenItem = false;
  let position = 0;

  for (const b of doc.blocks) {
    const text = b.text.trim();
    if (b.type === "divider") continue;
    if (isHeading(b) || b.type === "toggle") {
      group = text || undefined;
      continue;
    }
    if (isItemBlock(b)) {
      seenItem = true;
      const { title, quantity } = splitQuantity(text);
      items.push({
        title,
        itemType: quantity ? "quantity" : "standard",
        required: b.type === "check",
        priority: "normal" as TaskPriority,
        position: position++,
        ...(quantity ? { quantity } : {}),
        ...(group ? { category: group } : {}),
      });
      continue;
    }
    if (!text) continue;
    if (!seenItem && !group) intro.push(text);
    else
      items.push({
        title: text,
        itemType: "note",
        required: false,
        priority: "normal" as TaskPriority,
        position: position++,
        ...(group ? { category: group } : {}),
      });
  }

  const description = intro.join("\n").trim();
  return {
    name: doc.title.trim() || "Untitled checklist",
    category,
    ...(description ? { description } : {}),
    ...(items.length ? { items } : {}),
  };
}

/** Existing template → document, so editing reuses the same surface. */
export function templateToDoc(detail: ChecklistTemplateDetail): EditorDoc {
  const blocks: Block[] = [];
  if (detail.description)
    for (const line of detail.description.split("\n")) blocks.push(block("text", line));

  let group: string | null = null;
  for (const item of [...detail.items].sort((a, b) => a.position - b.position)) {
    const key = item.category ?? null;
    if (key !== group) {
      group = key;
      if (key) blocks.push(block("h3", key));
    }
    const label = item.quantity ? `${item.quantity} ${item.title}` : item.title;
    blocks.push(
      item.itemType === "note"
        ? block("text", label)
        : block(item.required ? "check" : "todo", label),
    );
  }
  if (!blocks.length) blocks.push(block("check"));
  return { title: detail.name, blocks };
}

/* ---------------- task ---------------- */

export type TaskDraftExtras = {
  priority?: TaskPriority;
  dueAt?: string;
  tags?: string[];
};

export type TaskDraft = {
  input: CreateTaskInput;
  /** Turned into real subtasks with POST /tasks/:id/subtasks after create. */
  steps: string[];
};

export function docToTaskDraft(doc: EditorDoc, extras: TaskDraftExtras = {}): TaskDraft {
  const paragraphs: string[] = [];
  const steps: string[] = [];

  for (const b of doc.blocks) {
    const text = b.text.trim();
    if (!text || b.type === "divider") continue;
    if (isItemBlock(b)) steps.push(splitQuantity(text).title);
    else if (isHeading(b)) paragraphs.push(text.toUpperCase());
    else paragraphs.push(text);
  }

  const description = paragraphs.join("\n").trim();
  return {
    input: {
      title: doc.title.trim() || "Untitled task",
      ...(description ? { description } : {}),
      ...(extras.priority ? { priority: extras.priority } : {}),
      ...(extras.dueAt ? { dueAt: extras.dueAt } : {}),
      ...(extras.tags?.length ? { tags: extras.tags } : {}),
    },
    steps,
  };
}

/** Existing task → document, so editing reuses the same surface. */
export function taskToDoc(task: TaskDetail): EditorDoc {
  const blocks: Block[] = [];
  if (task.description)
    for (const line of task.description.split("\n")) blocks.push(block("text", line));
  for (const s of [...(task.subtasks ?? [])].sort((a, b) => a.position - b.position)) {
    const b = block("todo", s.title);
    b.checked = s.completed;
    blocks.push(b);
  }
  if (!blocks.length) blocks.push(block());
  return { title: task.title, blocks };
}
