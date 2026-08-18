import type { TaskSummary } from "@/lib/api/types";
import {
  addLocalDays,
  dueDateKey,
  formatDueLabel,
  isDueToday,
  isOverdue,
  localDateKey,
  startOfLocalDay,
} from "./task-dates";

export type BoardColumn = "inbox" | "today" | "active" | "done";

export type DateGroup = "overdue" | "today" | "tomorrow" | "this_week" | "later" | "no_date";

const open = (status: TaskSummary["status"]) => status !== "completed" && status !== "cancelled";

export { formatDueLabel, isDueToday, isOverdue };

export const boardColumns: { id: BoardColumn; title: string; hint: string }[] = [
  { id: "inbox", title: "Capture", hint: "Not yet scheduled" },
  { id: "today", title: "Today", hint: "Due now" },
  { id: "active", title: "In motion", hint: "Working or waiting" },
  { id: "done", title: "Done", hint: "Closed out" },
];

export const dateGroupLabels: Record<DateGroup, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This week",
  later: "Later",
  no_date: "Anytime",
};

function endOfDay(d = new Date()) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function boardColumnFor(task: TaskSummary, now = new Date()): BoardColumn {
  if (task.status === "completed" || task.status === "cancelled") return "done";
  if (task.status === "inbox" && !task.dueAt) return "inbox";
  if (isOverdue(task, now) || isDueToday(task, now) || task.pinned) return "today";
  if (task.status === "in_progress" || task.status === "waiting" || task.status === "blocked") {
    return "active";
  }
  if (task.dueAt) return "active";
  return "inbox";
}

export function dateGroupFor(task: TaskSummary, now = new Date()): DateGroup {
  if (!open(task.status)) return "later";
  if (!task.dueAt) return "no_date";
  if (isOverdue(task, now)) return "overdue";
  if (isDueToday(task, now)) return "today";
  const tomorrowKey = localDateKey(addLocalDays(startOfLocalDay(now), 1));
  if (dueDateKey(task.dueAt) === tomorrowKey) return "tomorrow";
  const weekEnd = endOfDay(addLocalDays(startOfLocalDay(now), 7));
  if (new Date(task.dueAt).getTime() <= weekEnd.getTime()) return "this_week";
  return "later";
}

export function groupByBoard(tasks: TaskSummary[]): Record<BoardColumn, TaskSummary[]> {
  const buckets: Record<BoardColumn, TaskSummary[]> = {
    inbox: [],
    today: [],
    active: [],
    done: [],
  };
  for (const task of tasks) {
    buckets[boardColumnFor(task)].push(task);
  }
  for (const key of Object.keys(buckets) as BoardColumn[]) {
    buckets[key].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }
  return buckets;
}

export function groupByDate(tasks: TaskSummary[]): { group: DateGroup; tasks: TaskSummary[] }[] {
  const order: DateGroup[] = ["overdue", "today", "tomorrow", "this_week", "later", "no_date"];
  const map = new Map<DateGroup, TaskSummary[]>();
  for (const g of order) map.set(g, []);
  for (const task of tasks.filter(open)) {
    map.get(dateGroupFor(task))!.push(task);
  }
  return order
    .map((group) => ({
      group,
      tasks: (map.get(group) ?? []).sort(
        (a, b) => +new Date(a.dueAt ?? a.createdAt) - +new Date(b.dueAt ?? b.createdAt),
      ),
    }))
    .filter((entry) => entry.tasks.length > 0);
}
