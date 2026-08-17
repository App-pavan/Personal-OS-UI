import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TaskBoardColumn({
  title,
  hint,
  count,
  accent,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-[420px] flex-col rounded-2xl border border-hairline/60 bg-surface/30 p-3 backdrop-blur-sm",
        accent,
      )}
    >
      <header className="mb-3 px-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <span className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            {count}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">{children}</div>
    </section>
  );
}

export function TaskTimelineSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="animate-rise space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h2 className="label-eyebrow">{title}</h2>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}
