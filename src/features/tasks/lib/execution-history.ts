import type { TaskSummary } from "@/lib/api/types";
import { isTaskCompleted } from "./task-filters";
import { localDateKey, startOfLocalDay } from "./task-dates";

export type ExecutionHistoryEntry = {
  task: TaskSummary;
  metaLabel: string;
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

function formatCompletionMeta(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Completed";

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const hasMeaningfulTime =
    date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;

  return hasMeaningfulTime ? `Completed · ${time}` : "Completed";
}

/** Group completed tasks into chronological execution history. */
export function buildExecutionHistory(
  completedTasks: TaskSummary[],
  now = new Date(),
): ExecutionHistoryGroup[] {
  const sorted = [...completedTasks]
    .map((task) => ({ task, at: getCompletionTimestamp(task) }))
    .filter((entry): entry is { task: TaskSummary; at: string } => Boolean(entry.at))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const groups = new Map<string, ExecutionHistoryEntry[]>();

  for (const { task, at } of sorted) {
    const key = localDateKey(new Date(at));
    const bucket = groups.get(key) ?? [];
    bucket.push({ task, metaLabel: formatCompletionMeta(at) });
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
