import type { TaskSummary } from "@/lib/api/types";
import { localDateKey, startOfLocalDay } from "./task-dates";
import {
  getNotCompletedTimestamp,
  getTimelineTerminalState,
  isTaskArchived,
  isTaskCompleted,
  isTaskNotCompleted,
  type TimelineTerminalState,
} from "./task-lifecycle";

export type ExecutionHistoryEntry = {
  task: TaskSummary;
  createdAt: string;
  terminalState: TimelineTerminalState;
  terminalAt: string;
};

export type ExecutionHistoryGroup = {
  key: string;
  label: string;
  dateHeadline: string;
  isToday: boolean;
  entries: ExecutionHistoryEntry[];
};

/** Best available completion timestamp for timeline ordering. */
export function getCompletionTimestamp(task: TaskSummary): string | null {
  if (task.completedAt) return task.completedAt;
  if (isTaskCompleted(task) && task.updatedAt) return task.updatedAt;
  return null;
}

/** Terminal event timestamp used to group timeline entries by date. */
export function getTimelineEventTimestamp(task: TaskSummary): string | null {
  const state = getTimelineTerminalState(task);
  if (!state) return null;

  if (state === "completed") {
    return getCompletionTimestamp(task);
  }
  if (state === "not_completed") {
    return getNotCompletedTimestamp(task);
  }
  if (state === "archived") {
    if (isTaskCompleted(task)) return getCompletionTimestamp(task);
    if (isTaskNotCompleted(task)) return getNotCompletedTimestamp(task);
    return task.archivedAt ?? task.updatedAt ?? null;
  }
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

function dateHeadline(key: string, now: Date): string {
  const todayKey = localDateKey(now);
  const date = new Date(`${key}T12:00:00`);
  const formatted = date
    .toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
  return key === todayKey ? formatted : formatted;
}

function hasMeaningfulTime(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

export function formatTimelineTime(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  if (!hasMeaningfulTime(iso)) return null;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function buildEntry(task: TaskSummary): ExecutionHistoryEntry | null {
  const terminalState = getTimelineTerminalState(task);
  const terminalAt = getTimelineEventTimestamp(task);
  if (!terminalState || !terminalAt) return null;

  return {
    task,
    createdAt: task.createdAt,
    terminalState,
    terminalAt,
  };
}

/** Group timeline-eligible tasks into chronological execution history. */
export function buildExecutionHistory(
  timelineTasks: TaskSummary[],
  now = new Date(),
): ExecutionHistoryGroup[] {
  const sorted = timelineTasks
    .map(buildEntry)
    .filter((entry): entry is ExecutionHistoryEntry => Boolean(entry))
    .sort((a, b) => new Date(b.terminalAt).getTime() - new Date(a.terminalAt).getTime());

  const groups = new Map<string, ExecutionHistoryEntry[]>();

  for (const entry of sorted) {
    const key = localDateKey(new Date(entry.terminalAt));
    const bucket = groups.get(key) ?? [];
    bucket.push(entry);
    groups.set(key, bucket);
  }

  const todayKey = localDateKey(now);

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, entries]) => ({
      key,
      label: groupLabel(key, now),
      dateHeadline: dateHeadline(key, now),
      isToday: key === todayKey,
      entries: entries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }));
}

export function terminalStateLabel(state: TimelineTerminalState): string {
  switch (state) {
    case "completed":
      return "Completed";
    case "not_completed":
      return "Not completed";
    case "archived":
      return "Archived";
  }
}
