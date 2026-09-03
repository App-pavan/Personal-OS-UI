import type { TaskWorkspaceFilter } from "@/features/tasks/lib/task-timeline";
import { taskSegmentItem, taskSegmented } from "@/features/tasks/lib/tasks-ui";

const FILTERS: { key: TaskWorkspaceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export function TasksFilterTabs({
  value,
  onChange,
}: {
  value: TaskWorkspaceFilter;
  onChange: (filter: TaskWorkspaceFilter) => void;
}) {
  return (
    <div className={taskSegmented} role="tablist" aria-label="Task filters">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={taskSegmentItem(value === key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
