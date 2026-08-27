import { cn } from "@/lib/utils";
import type { RuntimeLogEvent } from "@/lib/api/runtime-types";
import {
  eventVisualLevel,
  formatEventTime,
  humanizeToken,
  providerLabel,
  serviceLabel,
} from "@/features/runtime/lib/activity-utils";
import type { SemanticTone } from "@/lib/design/semantic";
import { semanticTextClasses } from "@/lib/design/semantic";

function levelTone(level: ReturnType<typeof eventVisualLevel>): SemanticTone {
  switch (level) {
    case "SUCCESS":
      return "success";
    case "ERROR":
      return "danger";
    case "WARN":
      return "warning";
    case "DEBUG":
      return "muted";
    default:
      return "info";
  }
}

function levelDotClass(level: ReturnType<typeof eventVisualLevel>): string {
  switch (level) {
    case "SUCCESS":
      return "bg-primary";
    case "ERROR":
      return "bg-destructive";
    case "WARN":
      return "bg-amber-400";
    case "DEBUG":
      return "bg-muted-foreground/40";
    default:
      return "bg-primary/70";
  }
}

export function RuntimeEventRow({
  log,
  selected,
  onSelect,
  isNew,
}: {
  log: RuntimeLogEvent;
  selected: boolean;
  onSelect: () => void;
  isNew?: boolean;
}) {
  const visual = eventVisualLevel(log);
  const tone = levelTone(visual);
  const context = [
    log.service ? serviceLabel(log.service) : null,
    log.provider ? providerLabel(log.provider) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border px-3 py-2.5 text-left transition",
        "hover:bg-muted/30",
        selected ? "border-primary/30 bg-primary/5" : "border-transparent",
        visual === "ERROR" && !selected && "border-destructive/15",
        isNew && "animate-in fade-in slide-in-from-top-1 duration-300",
      )}
    >
      <time className="pt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
        {formatEventTime(log.timestamp)}
      </time>

      <div className="min-w-0 space-y-1">
        <div className="flex items-start gap-2">
          <span
            className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", levelDotClass(visual))}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-mono text-[11px] tracking-wide uppercase",
                semanticTextClasses(tone),
              )}
            >
              {humanizeToken(log.event)}
            </p>
            {context ? <p className="text-[11px] text-muted-foreground">{context}</p> : null}
            <p className="mt-1 text-sm leading-snug">{log.message}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
