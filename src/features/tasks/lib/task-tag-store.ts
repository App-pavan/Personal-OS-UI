import {
  formatTagDisplayName,
  GENERAL_TAG_ID,
  nextTagColor,
  normalizeTagId,
  SYSTEM_GENERAL_TAG,
  TASK_TAGS_STORAGE_KEY,
  type TagColorKey,
  type TaskTag,
} from "./task-tags";

function readStore(): TaskTag[] {
  try {
    const raw = window.localStorage.getItem(TASK_TAGS_STORAGE_KEY);
    if (!raw) return [SYSTEM_GENERAL_TAG];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [SYSTEM_GENERAL_TAG];
    const tags = parsed
      .filter((t) => t && typeof t === "object" && typeof t.id === "string")
      .map((t) => ({
        id: normalizeTagId(String(t.id)),
        name: formatTagDisplayName(String(t.name ?? t.id)),
        color: String(t.color) as TagColorKey,
        system: Boolean(t.system),
        createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
      }));
    return tags.some((t) => t.id === GENERAL_TAG_ID) ? tags : [SYSTEM_GENERAL_TAG, ...tags];
  } catch {
    return [SYSTEM_GENERAL_TAG];
  }
}

function writeStore(tags: TaskTag[]) {
  window.localStorage.setItem(TASK_TAGS_STORAGE_KEY, JSON.stringify(tags));
}

export function listStoredTags(): TaskTag[] {
  return readStore().sort((a, b) => a.name.localeCompare(b.name));
}

export function getStoredTag(id: string): TaskTag | undefined {
  const normalized = normalizeTagId(id);
  return readStore().find((t) => t.id === normalized);
}

export function ensureTagInStore(id: string, displayName?: string): TaskTag {
  const normalized = normalizeTagId(id);
  const existing = getStoredTag(normalized);
  if (existing) return existing;

  const tags = readStore();
  const created: TaskTag = {
    id: normalized,
    name: formatTagDisplayName(displayName ?? id),
    color: nextTagColor(tags.map((t) => t.color)),
    createdAt: new Date().toISOString(),
  };
  writeStore([...tags, created]);
  return created;
}

export function createTag(name: string): TaskTag {
  const normalized = normalizeTagId(name);
  if (!normalized) throw new Error("Tag name is required.");
  if (normalized === GENERAL_TAG_ID) return SYSTEM_GENERAL_TAG;

  const existing = getStoredTag(normalized);
  if (existing) return existing;

  const tags = readStore();
  const created: TaskTag = {
    id: normalized,
    name: formatTagDisplayName(name),
    color: nextTagColor(tags.map((t) => t.color)),
    createdAt: new Date().toISOString(),
  };
  writeStore([...tags, created]);
  return created;
}

/** Merge tag names discovered on tasks into the local registry. */
export function syncTagsFromTasks(taskTagIds: string[]) {
  const tags = readStore();
  let changed = false;
  for (const raw of taskTagIds) {
    const id = normalizeTagId(raw);
    if (!id || id === GENERAL_TAG_ID) continue;
    if (tags.some((t) => t.id === id)) continue;
    tags.push({
      id,
      name: formatTagDisplayName(raw),
      color: nextTagColor(tags.map((t) => t.color)),
      createdAt: new Date().toISOString(),
    });
    changed = true;
  }
  if (changed) writeStore(tags);
}
