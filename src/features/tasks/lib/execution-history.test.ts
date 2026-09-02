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
  it("groups completed tasks by completion date", () => {
    const now = new Date("2026-09-02T15:00:00.000Z");
    const groups = buildExecutionHistory(
      [
        task({
          id: "1",
          title: "Morning task",
          completedAt: "2026-09-02T10:42:00.000Z",
        }),
        task({
          id: "2",
          title: "Earlier today",
          completedAt: "2026-09-02T09:15:00.000Z",
        }),
      ],
      now,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Today");
    expect(groups[0]?.entries).toHaveLength(2);
    expect(groups[0]?.entries[0]?.metaLabel).toContain("Completed ·");
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
});
