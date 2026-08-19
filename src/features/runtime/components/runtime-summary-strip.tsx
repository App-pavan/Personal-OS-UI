import { cn } from "@/lib/utils";

export function RuntimeSummaryStrip({
  running,
  errors,
  warnings,
  events,
  className,
}: {
  running: number;
  errors: number;
  warnings: number;
  events: number;
  className?: string;
}) {
  const items = [
    { label: "Running", value: running, tone: "tone-info-text" },
    { label: "Errors", value: errors, tone: "tone-danger-text" },
    { label: "Warnings", value: warnings, tone: "tone-warning-text" },
    { label: "Events", value: events, tone: "text-foreground" },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline/60 bg-hairline/40 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-background/80 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className={cn("mt-0.5 font-mono text-lg tabular-nums", item.tone)}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
