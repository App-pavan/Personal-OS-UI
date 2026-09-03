import type { TaskSummary } from "@/lib/api/types";
import {
  addLocalDays,
  compareDateKeys,
  dateFromLocalKey,
  localDateKey,
  startOfLocalDay,
} from "./task-dates";
import { isActiveIncomplete } from "./task-lifecycle";

export type TaskWorkspaceFilter = "all" | "active" | "completed" | "archived";

/** @deprecated Use TaskWorkspaceFilter */
export type TimelineFilter = TaskWorkspaceFilter;

export type DateSection = {
  key: string;
  date: Date | null;
  headline: string;
  subline: string;
  isToday: boolean;
  /** @deprecated Overdue sections removed; always false */
  isOverdueSection: boolean;
  tasks: TaskSummary[];
};

export type WorkspaceSummary = {
  ongoing: number;
  completed: number;
  notCompleted: number;
  archived: number;
};

export {
  defaultDueForDate,
  formatTaskTime,
  isDueToday,
  startOfLocalDay as startOfDay,
  addLocalDays as addDays,
  localDateKey as dateKey,
} from "./task-dates";

function creationDateLabels(key: string, now: Date): { headline: string; subline: string; isToday: boolean } {
  const todayKey = localDateKey(now);
  const date = dateFromLocalKey(key);
  const formatted = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (key === todayKey) {
    return {
      headline: "TODAY",
      subline: formatted.toUpperCase(),
      isToday: true,
    };
  }

  return {
    headline: formatted.toUpperCase(),
    subline: "",
    isToday: false,
  };
}

function sortByCreatedDesc(a: TaskSummary, b: TaskSummary): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/** Group ongoing tasks by creation date (newest groups first). */
export function buildCreationDateGroups(tasks: TaskSummary[], now = new Date()): DateSection[] {
  const grouped = new Map<string, TaskSummary[]>();

  for (const task of tasks) {
    if (!isActiveIncomplete(task)) continue;
    const key = localDateKey(new Date(task.createdAt));
    const bucket = grouped.get(key) ?? [];
    bucket.push(task);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => compareDateKeys(b, a))
    .map(([key, sectionTasks]) => {
      const labels = creationDateLabels(key, now);
      return {
        key,
        date: dateFromLocalKey(key),
        ...labels,
        isOverdueSection: false,
        tasks: [...sectionTasks].sort(sortByCreatedDesc),
      };
    });
}

/** Group any task list by creation date (for completed/archived filter views). */
export function buildCreationDateGroupsForTasks(
  tasks: TaskSummary[],
  now = new Date(),
): DateSection[] {
  const grouped = new Map<string, TaskSummary[]>();

  for (const task of tasks) {
    const key = localDateKey(new Date(task.createdAt));
    const bucket = grouped.get(key) ?? [];
    bucket.push(task);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => compareDateKeys(b, a))
    .map(([key, sectionTasks]) => {
      const labels = creationDateLabels(key, now);
      return {
        key,
        date: dateFromLocalKey(key),
        ...labels,
        isOverdueSection: false,
        tasks: [...sectionTasks].sort(sortByCreatedDesc),
      };
    });
}

/** @deprecated Use buildCreationDateGroups */
export function buildDateTimeline(
  tasks: TaskSummary[],
  _filter: TaskWorkspaceFilter,
  now = new Date(),
): DateSection[] {
  return buildCreationDateGroups(tasks, now);
}

export function summarizeWorkspace(tasks: TaskSummary[]): WorkspaceSummary {
  let ongoing = 0;
  let completed = 0;
  let notCompleted = 0;
  let archived = 0;

  for (const task of tasks) {
    if (task.archived || task.status === "archived") {
      archived++;
      continue;
    }
    if (task.status === "completed" || task.completedAt) {
      completed++;
      continue;
    }
    if (task.status === "cancelled" || task.notCompletedAt) {
      notCompleted++;
      continue;
    }
    ongoing++;
  }

  return { ongoing, completed, notCompleted, archived };
}

/** @deprecated Use summarizeWorkspace */
export function summarizeTasks(tasks: TaskSummary[]): WorkspaceSummary {
  return summarizeWorkspace(tasks);
}

export function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
