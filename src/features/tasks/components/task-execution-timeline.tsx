import { useEffect, useRef } from "react";
import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { TaskTimelineItem } from "./task-timeline-item";

export function TaskExecutionTimeline({
  sections,
  focusDateKey,
  selectedId,
  onOpen,
  onToggleComplete,
}: {
  sections: DateSection[];
  focusDateKey?: string;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
}) {
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!focusDateKey) return;
    const key = focusDateKey === "scroll-today" ? sections.find((s) => s.isToday)?.key : focusDateKey;
    if (!key) return;
    sectionRefs.current.get(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusDateKey, sections]);

  if (!sections.length) {
    return (
      <div className="rounded-xl border border-dashed border-hairline/60 px-6 py-14 text-center">
        <p className="text-sm font-medium">Nothing scheduled.</p>
        <p className="mt-1 text-sm text-muted-foreground">A clear day — or time to plan ahead.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4">
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-[7px] w-px bg-gradient-to-b from-primary/40 via-hairline to-transparent"
        aria-hidden
      />

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section.key}
            ref={(node) => {
              if (node) sectionRefs.current.set(section.key, node);
              else sectionRefs.current.delete(section.key);
            }}
            className="relative animate-rise"
          >
            <div className="grid grid-cols-[18px_1fr] gap-4">
              <div className="relative flex justify-center pt-1">
                <span
                  className={cn(
                    "relative z-10 size-3.5 rounded-full border-2 bg-background",
                    section.isToday
                      ? "border-primary shadow-[0_0_12px_rgba(65,174,169,0.45)] animate-pulse"
                      : section.isOverdueSection
                        ? "border-destructive/70"
                        : "border-hairline",
                  )}
                />
              </div>
              <div>
                <header
                  className={cn(
                    "sticky top-16 z-10 -mx-2 mb-3 rounded-md px-2 py-1 backdrop-blur-sm",
                    section.isToday && "bg-primary/5",
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-xs tracking-[0.2em]",
                      section.isToday ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    {section.headline}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{section.subline}</p>
                </header>

                {section.tasks.length ? (
                  <div className="space-y-0.5">
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
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing on this date.</p>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
