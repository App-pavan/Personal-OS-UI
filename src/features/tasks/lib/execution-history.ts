import type { TaskSummary } from "@/lib/api/types";
import { localDateKey, startOfLocalDay } from "./task-dates";
import {
  isTaskArchived,
  isTaskCompleted,
} from "./task-lifecycle";

export type ExecutionHistoryEntry = {
  task: TaskSummary;
  metaLabel: string;
  secondaryMeta?: string;
};

export type ExecutionHistoryGroup = {
  key: string;
  label: string;
  entries: ExecutionHistoryEntry[];
};

/** Best available completion timestamp for timeline ordering. */
export function getCompletionTimestamp(task: TaskSummary): string | null {
  if (task.completedAt) return task.completedAt;
  if (isTaskCompleted(task) && task.updatedAt) return task.updatedAt;
  return null;
}

/** Event timestamp used to group timeline entries by date. */
export function getTimelineEventTimestamp(task: TaskSummary): string | null {
  if (isTaskArchived(task)) {
    return task.archivedAt ?? task.updatedAt ?? null;
  }
  return getCompletionTimestamp(task);
}

function groupLabel(key: string, now: Date): string {
  const todayKey = localDateKey(now);
  const yesterdayKey = localDateKey(new Date(now.getTime() - 86_400_000));

  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";

  const date = new Date(`${key}T12:00:00`);
  const daysAgo = Math.floor(
    (startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / 86_400_000,
  );
  if (daysAgo >= 2 && daysAgo <= 6) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date
    .toLocaleDateString([], { month: "short", day: "numeric" })
    .toUpperCase();
}

function hasMeaningfulTime(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

function formatTime(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  if (!hasMeaningfulTime(iso)) return null;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function buildEntryMeta(task: TaskSummary): Pick<ExecutionHistoryEntry, "metaLabel" | "secondaryMeta"> {
  const completed = isTaskCompleted(task);
  const archived = isTaskArchived(task);

  if (completed && archived) {
    const completionIso = task.completedAt ?? getCompletionTimestamp(task);
    const time = completionIso ? formatTime(completionIso) : null;
    return {
      metaLabel: time ? `Completed · ${time}` : "Completed",
      secondaryMeta: "Archived",
    };
  }

  if (completed) {
    const completionIso = task.completedAt ?? getCompletionTimestamp(task);
    if (!completionIso) return { metaLabel: "Completed" };
    const time = formatTime(completionIso);
    return { metaLabel: time ? `Completed · ${time}` : "Completed" };
  }

  if (archived) {
    const archiveIso = task.archivedAt;
    const time = archiveIso ? formatTime(archiveIso) : null;
    if (time) return { metaLabel: `Archived · ${time}` };
    return { metaLabel: "Archived · Not completed" };
  }

  return { metaLabel: "Completed" };
}

/** Group timeline-eligible tasks into chronological execution history. */
export function buildExecutionHistory(
  timelineTasks: TaskSummary[],
  now = new Date(),
): ExecutionHistoryGroup[] {
  const sorted = [...timelineTasks]
    .map((task) => ({ task, at: getTimelineEventTimestamp(task) }))
    .filter((entry): entry is { task: TaskSummary; at: string } => Boolean(entry.at))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const groups = new Map<string, ExecutionHistoryEntry[]>();

  for (const { task, at } of sorted) {
    const key = localDateKey(new Date(at));
    const bucket = groups.get(key) ?? [];
    bucket.push({ task, ...buildEntryMeta(task) });
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, entries]) => ({
      key,
      label: groupLabel(key, now),
      entries,
    }));
}
