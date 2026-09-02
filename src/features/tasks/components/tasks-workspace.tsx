import type { ReactNode } from "react";
import { tasksPageShell, tasksWorkspaceGrid } from "@/features/tasks/lib/tasks-ui";
import { cn } from "@/lib/utils";

/** Unified Tasks page grid — header + main workspace + execution timeline. */
export function TasksWorkspace({
  header,
  main,
  timeline,
  className,
}: {
  header: ReactNode;
  main: ReactNode;
  timeline: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(tasksPageShell, "pb-10", className)}>
      <div className={cn(tasksWorkspaceGrid, "min-h-[calc(100dvh-5rem)]")}>
        <header className="xl:col-span-2">{header}</header>

        <section className="min-w-0" aria-label="Active tasks">
          {main}
        </section>

        <aside
          className="min-w-0 border-t border-[var(--task-border)] pt-10 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10"
          aria-label="Execution timeline"
        >
          <div className="xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto xl:pr-1 [scrollbar-width:thin]">
            {timeline}
          </div>
        </aside>
      </div>
    </div>
  );
}
