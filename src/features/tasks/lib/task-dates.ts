import type { TaskPriority, TaskStatus, TaskSummary } from "@/lib/api/types";

const OPEN = (status: TaskStatus) =>
  status !== "completed" && status !== "cancelled" && status !== "archived";

/** Local calendar start (00:00:00.000 in the user's timezone). */
export function startOfLocalDay(d: Date = new Date()): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addLocalDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** YYYY-MM-DD in the user's local timezone — never use toISOString().slice(0, 10). */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dueDateKey(iso: string): string {
  return localDateKey(new Date(iso));
}

export function dateFromLocalKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!, 12, 0, 0, 0);
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Date-only default for quick create — local midnight, no fake 09:00. */
export function defaultDueForDate(date: Date): string {
  return startOfLocalDay(date).toISOString();
}

/** Legacy quick-create used 09:00 local as an implicit date-only sentinel. */
const LEGACY_DATE_ONLY_HOUR = 9;

export function hasExplicitDueTime(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  if (h === 0 && m === 0 && s === 0) return false;
  if (h === LEGACY_DATE_ONLY_HOUR && m === 0 && s === 0) return false;
  return true;
}

export function formatTaskTime(iso?: string): string | null {
  if (!hasExplicitDueTime(iso)) return null;
  return new Date(iso!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function isOverdue(task: Pick<TaskSummary, "dueAt" | "status">, now = new Date()): boolean {
  if (!task.dueAt || !OPEN(task.status)) return false;
  return dueDateKey(task.dueAt) < localDateKey(now);
}

export function isDueToday(task: Pick<TaskSummary, "dueAt">, now = new Date()): boolean {
  if (!task.dueAt) return false;
  return dueDateKey(task.dueAt) === localDateKey(now);
}

export function isUpcoming(task: Pick<TaskSummary, "dueAt" | "status">, now = new Date()): boolean {
  if (!task.dueAt || !OPEN(task.status)) return false;
  return dueDateKey(task.dueAt) > localDateKey(now);
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function sortTasksInTimelineSection(a: TaskSummary, b: TaskSummary): number {
  const aTimed = hasExplicitDueTime(a.dueAt);
  const bTimed = hasExplicitDueTime(b.dueAt);
  if (aTimed && bTimed) {
    const byTime = new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime();
    if (byTime !== 0) return byTime;
  } else if (aTimed !== bTimed) {
    return aTimed ? -1 : 1;
  }

  const byPriority = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
  if (byPriority !== 0) return byPriority;

  return +new Date(a.createdAt) - +new Date(b.createdAt);
}

export function formatDueLabel(iso?: string, now = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const today = startOfLocalDay(now);
  const tomorrow = addLocalDays(today, 1);
  const timeSuffix = hasExplicitDueTime(iso)
    ? ` · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  if (d.toDateString() === today.toDateString()) return `Today${timeSuffix}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow${timeSuffix}`;

  if (hasExplicitDueTime(iso)) {
    return d.toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}
