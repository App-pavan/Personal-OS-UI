import type { TaskSummary } from "@/lib/api/types";

export const GENERAL_TAG_ID = "general";
export const GENERAL_TAG_NAME = "General";
export const TASK_TAGS_STORAGE_KEY = "personal-os-task-tags";

/** Controlled palette — stable keys map to theme-friendly colors. */
export const TAG_COLOR_PALETTE = [
  { key: "teal", dot: "#2dd4bf", tint: "rgba(45, 212, 191, 0.14)" },
  { key: "blue", dot: "#60a5fa", tint: "rgba(96, 165, 250, 0.14)" },
  { key: "violet", dot: "#a78bfa", tint: "rgba(167, 139, 250, 0.14)" },
  { key: "purple", dot: "#c084fc", tint: "rgba(192, 132, 252, 0.14)" },
  { key: "amber", dot: "#fbbf24", tint: "rgba(251, 191, 36, 0.14)" },
  { key: "orange", dot: "#fb923c", tint: "rgba(251, 146, 60, 0.14)" },
  { key: "rose", dot: "#fb7185", tint: "rgba(251, 113, 133, 0.14)" },
  { key: "green", dot: "#4ade80", tint: "rgba(74, 222, 128, 0.14)" },
  { key: "cyan", dot: "#22d3ee", tint: "rgba(34, 211, 238, 0.14)" },
] as const;

export type TagColorKey = (typeof TAG_COLOR_PALETTE)[number]["key"];

export type TaskTag = {
  id: string;
  name: string;
  color: TagColorKey;
  system?: boolean;
  createdAt: string;
};

export function normalizeTagId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function formatTagDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function isGeneralTag(tagId: string | null | undefined): boolean {
  return !tagId || tagId === GENERAL_TAG_ID;
}

/** Raw tag id stored on the task (defaults to general). */
export function getTaskTagId(task: Pick<TaskSummary, "tags">): string {
  const raw = task.tags?.[0]?.trim();
  if (!raw) return GENERAL_TAG_ID;
  return normalizeTagId(raw);
}

/** Visible tag id, or null when general/default. */
export function getVisibleTaskTagId(task: Pick<TaskSummary, "tags">): string | null {
  const id = getTaskTagId(task);
  return isGeneralTag(id) ? null : id;
}

export function tagsPayloadForAssignment(tagId: string): string[] {
  return [isGeneralTag(tagId) ? GENERAL_TAG_ID : normalizeTagId(tagId)];
}

export function colorForKey(key: TagColorKey) {
  return TAG_COLOR_PALETTE.find((c) => c.key === key) ?? TAG_COLOR_PALETTE[0]!;
}

export function nextTagColor(used: TagColorKey[]): TagColorKey {
  const unused = TAG_COLOR_PALETTE.find((c) => !used.includes(c.key));
  if (unused) return unused.key;
  return TAG_COLOR_PALETTE[used.length % TAG_COLOR_PALETTE.length]!.key;
}

export const SYSTEM_GENERAL_TAG: TaskTag = {
  id: GENERAL_TAG_ID,
  name: GENERAL_TAG_NAME,
  color: "blue",
  system: true,
  createdAt: new Date(0).toISOString(),
};
