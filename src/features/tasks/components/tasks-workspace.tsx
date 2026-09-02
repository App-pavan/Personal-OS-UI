import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Two-column Tasks workspace — main task area + execution timeline. */
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
    <div className={cn("flex min-h-[calc(100dvh-5rem)] flex-col", className)}>
      {header}
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <section
          className="flex min-h-0 min-w-0 flex-1 flex-col xl:flex-[3]"
          aria-label="Tasks"
        >
          <div className="mx-auto min-h-0 w-full max-w-[920px] flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            {main}
          </div>
        </section>
        <aside
          className="min-h-0 min-w-0 border-t border-[var(--task-border)] xl:flex-[1] xl:border-t-0 xl:border-l"
          aria-label="Execution timeline"
        >
          <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-6 xl:max-h-[calc(100dvh-12rem)] xl:py-8">
            {timeline}
          </div>
        </aside>
      </div>
    </div>
  );
}
