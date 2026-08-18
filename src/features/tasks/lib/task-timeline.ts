import type { TaskSummary } from "@/lib/api/types";
import {
  addLocalDays,
  compareDateKeys,
  dateFromLocalKey,
  dueDateKey,
  isDueToday,
  isOverdue,
  isUpcoming,
  localDateKey,
  sortTasksInTimelineSection,
  startOfLocalDay,
} from "./task-dates";

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

export {
  defaultDueForDate,
  formatTaskTime,
  isDueToday,
  isOverdue,
  isUpcoming,
  startOfLocalDay as startOfDay,
  addLocalDays as addDays,
  localDateKey as dateKey,
} from "./task-dates";

function sectionLabels(key: string, now: Date): { headline: string; subline: string; isToday: boolean } {
  const todayKey = localDateKey(now);
  const date = dateFromLocalKey(key);
  const subline = date
    .toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();

  if (key === todayKey) {
    return { headline: "TODAY", subline, isToday: true };
  }

  const tomorrowKey = localDateKey(addLocalDays(startOfLocalDay(now), 1));
  if (key === tomorrowKey) {
    return { headline: "TOMORROW", subline, isToday: false };
  }

  return {
    headline: date.toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase(),
    subline,
    isToday: false,
  };
}

function makeDateSection(
  key: string,
  tasks: TaskSummary[],
  now: Date,
  isOverdueSection: boolean,
): DateSection {
  const labels = sectionLabels(key, now);
  return {
    key,
    date: dateFromLocalKey(key),
    ...labels,
    isOverdueSection,
    tasks: [...tasks].sort(sortTasksInTimelineSection),
  };
}

/** Group tasks onto calendar dates for the execution timeline. */
export function buildDateTimeline(
  tasks: TaskSummary[],
  filter: TimelineFilter,
  now = new Date(),
): DateSection[] {
  const todayKey = localDateKey(now);
  const scheduled = new Map<string, TaskSummary[]>();
  const unscheduled: TaskSummary[] = [];

  const overdueTasks = tasks
    .filter((t) => isOverdue(t, now) && OPEN(t.status))
    .sort(sortTasksInTimelineSection);

  for (const task of tasks) {
    if (filter === "today" && !isDueToday(task, now) && !isOverdue(task, now)) continue;
    if (filter === "upcoming" && !isUpcoming(task, now)) continue;
    if (filter === "overdue") continue;

    if (isOverdue(task, now) && OPEN(task.status)) continue;

    if (!task.dueAt) {
      if (filter === "all" || filter === "today") unscheduled.push(task);
      continue;
    }

    const key = dueDateKey(task.dueAt);
    const bucket = scheduled.get(key) ?? [];
    bucket.push(task);
    scheduled.set(key, bucket);
  }

  if (filter === "overdue") {
    if (!overdueTasks.length) return [];
    return [
      {
        key: "overdue",
        date: null,
        headline: "OVERDUE",
        subline: `${overdueTasks.length} TASK${overdueTasks.length === 1 ? "" : "S"}`,
        isToday: false,
        isOverdueSection: true,
        tasks: overdueTasks,
      },
    ];
  }

  const sections: DateSection[] = [];

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

  const datedKeys = [...scheduled.keys()].sort(compareDateKeys);
  const todayKeys = datedKeys.filter((k) => k === todayKey);
  const futureKeys = datedKeys.filter((k) => k > todayKey);
  const pastKeys = datedKeys.filter((k) => k < todayKey);

  for (const key of todayKeys) {
    sections.push(makeDateSection(key, scheduled.get(key) ?? [], now, false));
  }
  for (const key of futureKeys) {
    sections.push(makeDateSection(key, scheduled.get(key) ?? [], now, false));
  }
  for (const key of [...pastKeys].reverse()) {
    sections.push(makeDateSection(key, scheduled.get(key) ?? [], now, true));
  }

  if (unscheduled.length && filter !== "upcoming") {
    sections.push({
      key: "unscheduled",
      date: null,
      headline: "UNSCHEDULED",
      subline: "NO DATE",
      isToday: false,
      isOverdueSection: false,
      tasks: unscheduled.sort(sortTasksInTimelineSection),
    });
  }

  return sections;
}

export function summarizeTasks(tasks: TaskSummary[], now = new Date()): TimelineSummary {
  const open = tasks.filter(OPEN);
  return {
    today: open.filter((t) => isDueToday(t, now)).length,
    overdue: open.filter((t) => isOverdue(t, now)).length,
    upcoming: open.filter((t) => isUpcoming(t, now)).length,
    pending: open.filter((t) => t.status === "inbox" || t.status === "ready").length,
  };
}

export function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
