import type { TimelineFilter } from "@/features/tasks/lib/task-timeline";
import { taskSegmentItem, taskSegmented } from "@/features/tasks/lib/tasks-ui";

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
];

export function TasksFilterTabs({
  value,
  onChange,
}: {
  value: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
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
