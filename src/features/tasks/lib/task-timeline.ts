import type { TaskSummary } from "@/lib/api/types";

export type TimelineFilter = "all" | "today" | "upcoming" | "overdue";

export type DateSection = {
  key: string;
  date: Date | null;
  headline: string;
  subline: string;
  isToday: boolean;
  isOverdueSection: boolean;
  tasks: TaskSummary[];
};

export type TimelineSummary = {
  today: number;
  overdue: number;
  upcoming: number;
  pending: number;
};

const OPEN = (status: TaskSummary["status"]) =>
  status !== "completed" && status !== "cancelled" && status !== "archived";

export function startOfDay(d = new Date()) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function isOverdue(task: TaskSummary, now = new Date()) {
  if (!task.dueAt || !OPEN(task.status)) return false;
  return startOfDay(new Date(task.dueAt)).getTime() < startOfDay(now).getTime();
}

export function isDueToday(task: TaskSummary, now = new Date()) {
  if (!task.dueAt) return false;
  return startOfDay(new Date(task.dueAt)).getTime() === startOfDay(now).getTime();
}

export function isUpcoming(task: TaskSummary, now = new Date()) {
  if (!task.dueAt || !OPEN(task.status)) return false;
  return startOfDay(new Date(task.dueAt)).getTime() > startOfDay(now).getTime();
}

export function formatTaskTime(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (d.getHours() === 0 && d.getMinutes() === 0) return null;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function summarizeTasks(tasks: TaskSummary[], now = new Date()): TimelineSummary {
  const open = tasks.filter(OPEN);
  return {
    today: open.filter((t) => isDueToday(t, now)).length,
    overdue: open.filter((t) => isOverdue(t, now)).length,
    upcoming: open.filter((t) => isUpcoming(t, now)).length,
    pending: open.filter((t) => t.status === "pending" || t.status === "inbox").length,
  };
}

function sectionLabels(date: Date, now: Date): { headline: string; subline: string; isToday: boolean } {
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  const subline = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  if (diff === 0) return { headline: "TODAY", subline, isToday: true };
  if (diff === 1) return { headline: "TOMORROW", subline, isToday: false };
  return {
    headline: date.toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase(),
    subline,
    isToday: false,
  };
}

/** Group tasks onto calendar dates for the execution timeline. */
export function buildDateTimeline(
  tasks: TaskSummary[],
  filter: TimelineFilter,
  now = new Date(),
): DateSection[] {
  const today = startOfDay(now);
  const scheduled = new Map<string, TaskSummary[]>();
  const unscheduled: TaskSummary[] = [];

  const sections: DateSection[] = [];

  for (const task of tasks) {
    if (filter === "today" && !isDueToday(task, now) && !isOverdue(task, now)) continue;
    if (filter === "upcoming" && !isUpcoming(task, now)) continue;
    if (filter === "overdue" && !isOverdue(task, now)) continue;
    if (
      (filter === "all" || filter === "today") &&
      isOverdue(task, now) &&
      OPEN(task.status)
    ) {
      continue;
    }

    if (!task.dueAt) {
      if (filter === "all" || filter === "today") unscheduled.push(task);
      continue;
    }

    const key = dateKey(startOfDay(new Date(task.dueAt)));
    const bucket = scheduled.get(key) ?? [];
    bucket.push(task);
    scheduled.set(key, bucket);
  }

  const overdueTasks = tasks
    .filter((t) => isOverdue(t, now) && OPEN(t.status))
    .sort((a, b) => +new Date(a.dueAt ?? 0) - +new Date(b.dueAt ?? 0));

  if (filter === "overdue") {
    if (overdueTasks.length) {
      sections.push({
        key: "overdue",
        date: null,
        headline: "OVERDUE",
        subline: `${overdueTasks.length} TASK${overdueTasks.length === 1 ? "" : "S"}`,
        isToday: false,
        isOverdueSection: true,
        tasks: overdueTasks,
      });
    }
    return sections;
  }

  if ((filter === "all" || filter === "today") && overdueTasks.length) {
    sections.push({
      key: "overdue",
      date: null,
      headline: "OVERDUE",
      subline: `${overdueTasks.length} TASK${overdueTasks.length === 1 ? "" : "S"}`,
      isToday: false,
      isOverdueSection: true,
      tasks: overdueTasks,
    });
  }

  const keys = [...scheduled.keys()].sort();
  const datedSections: DateSection[] = keys.map((key) => {
    const date = new Date(`${key}T12:00:00`);
    const labels = sectionLabels(date, now);
    const sectionTasks = (scheduled.get(key) ?? []).sort((a, b) => {
      const ta = new Date(a.dueAt ?? a.createdAt).getTime();
      const tb = new Date(b.dueAt ?? b.createdAt).getTime();
      return ta - tb;
    });
    return {
      key,
      date,
      ...labels,
      isOverdueSection: date.getTime() < today.getTime(),
      tasks: sectionTasks,
    };
  });

  if (unscheduled.length && filter !== "upcoming" && filter !== "overdue") {
    datedSections.push({
      key: "unscheduled",
      date: null,
      headline: "UNSCHEDULED",
      subline: "NO DATE",
      isToday: false,
      isOverdueSection: false,
      tasks: unscheduled.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    });
  }

  return [...sections, ...datedSections];
}

export function defaultDueForDate(date: Date) {
  const d = startOfDay(date);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
