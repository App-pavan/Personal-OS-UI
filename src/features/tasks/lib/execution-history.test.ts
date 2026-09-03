import { describe, expect, it } from "vitest";
import type { TaskSummary } from "@/lib/api/types";
import { buildExecutionHistory, getCompletionTimestamp } from "./execution-history";

function task(partial: Partial<TaskSummary> & Pick<TaskSummary, "id" | "title">): TaskSummary {
  return {
    type: "personal",
    status: "completed",
    priority: "normal",
    progress: 100,
    pinned: false,
    favorite: false,
    archived: false,
    tags: [],
    labels: [],
    subtaskCount: 0,
    subtaskCompletedCount: 0,
    checklistItemCount: 0,
    commentCount: 0,
    attachmentCount: 0,
    dependencyCount: 0,
    hasReminder: false,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-17T16:22:00.000Z",
    ...partial,
  };
}

describe("execution-history", () => {
  it("groups completed tasks by terminal date with created → completed lifecycle", () => {
    const now = new Date("2026-09-02T15:00:00.000Z");
    const groups = buildExecutionHistory(
      [
        task({
          id: "1",
          title: "Morning task",
          createdAt: "2026-09-02T08:00:00.000Z",
          completedAt: "2026-09-02T10:42:00.000Z",
        }),
        task({
          id: "2",
          title: "Earlier today",
          createdAt: "2026-09-02T07:00:00.000Z",
          completedAt: "2026-09-02T09:15:00.000Z",
        }),
      ],
      now,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Today");
    expect(groups[0]?.entries).toHaveLength(2);
    expect(groups[0]?.entries[0]?.terminalState).toBe("completed");
    expect(groups[0]?.entries[0]?.createdAt).toBe("2026-09-02T08:00:00.000Z");
  });

  it("falls back to updatedAt when completedAt is missing", () => {
    const groups = buildExecutionHistory([
      task({
        id: "3",
        title: "Legacy completed task",
        status: "completed",
        completedAt: undefined,
        updatedAt: "2026-08-17T16:22:00.000Z",
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(getCompletionTimestamp(groups[0]!.entries[0]!.task)).toBe("2026-08-17T16:22:00.000Z");
  });

  it("includes not-completed tasks with not_completed terminal state", () => {
    const groups = buildExecutionHistory([
      task({
        id: "4",
        title: "Cancelled client presentation",
        status: "cancelled",
        notCompletedAt: "2026-08-18T21:10:00.000Z",
        createdAt: "2026-08-18T20:50:00.000Z",
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries[0]?.terminalState).toBe("not_completed");
  });

  it("includes archived incomplete tasks as archived terminal state", () => {
    const groups = buildExecutionHistory([
      task({
        id: "5",
        title: "Archived open task",
        status: "inbox",
        archived: true,
        archivedAt: "2026-08-18T00:00:00.000Z",
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries[0]?.terminalState).toBe("archived");
  });
});
