import { describe, expect, it } from "vitest";
import type { TaskSummary } from "@/lib/api/types";
import { computeTaskDashboardMetrics } from "./task-metrics";
import { selectFocusQueue } from "./focus-queue";

const base = (over: Partial<TaskSummary>): TaskSummary =>
  ({
    id: "1",
    title: "Task",
    status: "inbox",
    priority: "normal",
    tags: [],
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    archived: false,
    ...over,
  }) as TaskSummary;

describe("computeTaskDashboardMetrics", () => {
  it("counts open and due today without overdue bucket", () => {
    const now = new Date("2026-09-07T12:00:00");
    const metrics = computeTaskDashboardMetrics(
      [
        base({ id: "a", status: "in_progress" }),
        base({ id: "b", status: "in_progress", dueAt: "2026-09-07T15:00:00.000Z" }),
        base({ id: "c", status: "completed", completedAt: "2026-09-06T10:00:00.000Z" }),
        base({ id: "d", status: "cancelled", notCompletedAt: "2026-09-05T10:00:00.000Z" }),
      ],
      now,
    );
    expect(metrics.open).toBe(2);
    expect(metrics.dueToday).toBe(1);
    expect(metrics.completed).toBe(1);
    expect(metrics.completionPercent).toBe(33);
  });
});

describe("selectFocusQueue", () => {
  it("prioritizes urgent due-today tasks", () => {
    const now = new Date("2026-09-07T12:00:00");
    const queue = selectFocusQueue(
      [
        base({ id: "low", priority: "low", dueAt: "2026-09-10T10:00:00.000Z" }),
        base({ id: "urgent", priority: "urgent", dueAt: "2026-09-07T10:00:00.000Z" }),
      ],
      5,
      now,
    );
    expect(queue[0]?.id).toBe("urgent");
  });
});
