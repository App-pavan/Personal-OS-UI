import { useEffect, useRef } from "react";
import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { TaskContent } from "./task-content";

export function TaskExecutionTimeline({
  sections,
  completedTasks,
  focusDateKey,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
}: {
  sections: DateSection[];
  completedTasks: TaskSummary[];
  focusDateKey?: string;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}) {
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!focusDateKey) return;
    const key = focusDateKey === "scroll-today" ? sections.find((s) => s.isToday)?.key : focusDateKey;
    if (!key) return;
    sectionRefs.current.get(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusDateKey, sections]);

  return (
    <div>
      {sections.map((section) => (
        <div
          key={section.key}
          ref={(node) => {
            if (node) sectionRefs.current.set(section.key, node);
            else sectionRefs.current.delete(section.key);
          }}
        >
          <TaskContent
            sections={[section]}
            completedTasks={[]}
            selectedId={selectedId}
            onOpen={onOpen}
            onToggleComplete={onToggleComplete}
            onToggleFavorite={onToggleFavorite}
            onArchive={onArchive}
            onDelete={onDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        </div>
      ))}

      <TaskContent
        sections={[]}
        completedTasks={completedTasks}
        selectedId={selectedId}
        onOpen={onOpen}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onArchive={onArchive}
        onDelete={onDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
