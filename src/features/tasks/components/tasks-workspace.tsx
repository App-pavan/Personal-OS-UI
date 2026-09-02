import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Master-detail Tasks workspace — list + always-visible detail column on desktop. */
export function TasksWorkspace({
  header,
  list,
  detail,
  className,
}: {
  header: ReactNode;
  list: ReactNode;
  detail: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[calc(100dvh-5rem)] flex-col", className)}>
      {header}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className="flex min-h-0 min-w-0 flex-[3] flex-col border-b border-[var(--task-border-subtle)] lg:border-b-0 lg:border-r"
          aria-label="Task list"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{list}</div>
        </section>
        <aside
          className="hidden min-h-0 min-w-0 flex-[2] flex-col bg-[var(--task-surface)]/40 lg:flex lg:max-w-[440px] xl:max-w-[480px]"
          aria-label="Task details"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">{detail}</div>
        </aside>
      </div>
    </div>
  );
}
