import type { TaskSummary } from "@/lib/api/types";
import { isDueToday } from "@/features/tasks/lib/task-dates";
import {
  isActiveIncomplete,
  isActiveCompleted,
  isTaskActive,
} from "@/features/tasks/lib/task-lifecycle";

export type TaskDashboardMetrics = {
  open: number;
  dueToday: number;
  completed: number;
  completionPercent: number | null;
};

export function computeTaskDashboardMetrics(
  tasks: TaskSummary[],
  now = new Date(),
): TaskDashboardMetrics {
  const active = tasks.filter(isTaskActive);
  const open = active.filter(isActiveIncomplete);
  const dueToday = open.filter((t) => isDueToday(t, now));
  const completed = active.filter(isActiveCompleted);
  const total = open.length + completed.length;
  const completionPercent = total > 0 ? Math.round((completed.length / total) * 100) : null;

  return {
    open: open.length,
    dueToday: dueToday.length,
    completed: completed.length,
    completionPercent,
  };
}
