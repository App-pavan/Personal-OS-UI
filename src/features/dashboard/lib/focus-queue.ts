import type { TaskSummary } from "@/lib/api/types";
import { isDueToday, sortTasksInTimelineSection } from "@/features/tasks/lib/task-dates";
import { isActiveIncomplete } from "@/features/tasks/lib/task-lifecycle";

const PRIORITY_RANK: Record<TaskSummary["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function focusScore(task: TaskSummary, now: Date): number {
  let score = 0;
  if (isDueToday(task, now)) score += 100;
  if (task.priority === "urgent") score += 40;
  if (task.priority === "high") score += 20;
  if (task.pinned) score += 15;
  score -= PRIORITY_RANK[task.priority] ?? 2;
  return score;
}

/** Top active incomplete tasks the user should focus on now. */
export function selectFocusQueue(tasks: TaskSummary[], limit = 5, now = new Date()): TaskSummary[] {
  const candidates = tasks.filter(isActiveIncomplete);
  return [...candidates]
    .sort((a, b) => {
      const byScore = focusScore(b, now) - focusScore(a, now);
      if (byScore !== 0) return byScore;
      return sortTasksInTimelineSection(a, b);
    })
    .slice(0, limit);
}
