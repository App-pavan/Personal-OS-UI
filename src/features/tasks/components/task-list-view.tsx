import type { TaskSummary } from "@/lib/api/types";
import { buildDateTimeline, type TimelineFilter } from "../lib/task-timeline";
import { TaskTimelineItem } from "./task-timeline-item";

interface TaskListViewProps {
  tasks: TaskSummary[];
  filter: TimelineFilter;
  selectedId?: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
}

export function TaskListView({
  tasks,
  filter,
  selectedId,
  onOpen,
  onToggleComplete,
}: TaskListViewProps) {
  const sections = buildDateTimeline(tasks, filter);

  if (sections.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">Nothing matches this view.</p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.key}>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {section.headline}
            {section.subline ? ` · ${section.subline}` : ""}
          </h3>
          <div className="space-y-1.5">
            {section.tasks.map((task) => (
              <TaskTimelineItem
                key={task.id}
                task={task}
                selected={selectedId === task.id}
                onOpen={() => onOpen(task.id)}
                onToggleComplete={() => onToggleComplete(task)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
