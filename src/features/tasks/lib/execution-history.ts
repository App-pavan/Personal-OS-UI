import type { TaskSummary } from "@/lib/api/types";
import { localDateKey, startOfLocalDay } from "./task-dates";

export type ExecutionHistoryEntry = {
  task: TaskSummary;
  timeLabel: string;
};

export type ExecutionHistoryGroup = {
  key: string;
  label: string;
  entries: ExecutionHistoryEntry[];
};

function groupLabel(key: string, now: Date): string {
  const todayKey = localDateKey(now);
  const yesterdayKey = localDateKey(new Date(now.getTime() - 86_400_000));

  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";

  const date = new Date(`${key}T12:00:00`);
  const daysAgo = Math.floor((startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / 86_400_000);
  if (daysAgo >= 2 && daysAgo <= 6) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Group completed tasks into chronological execution history. */
export function buildExecutionHistory(
  completedTasks: TaskSummary[],
  now = new Date(),
): ExecutionHistoryGroup[] {
  const sorted = [...completedTasks]
    .filter((t) => t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const groups = new Map<string, ExecutionHistoryEntry[]>();

  for (const task of sorted) {
    const at = task.completedAt!;
    const key = localDateKey(new Date(at));
    const bucket = groups.get(key) ?? [];
    bucket.push({ task, timeLabel: formatTime(at) });
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
