import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { RuntimeLogEvent } from "@/lib/api/runtime-types";
import { RuntimeEventRow } from "./runtime-event-row";

export function RuntimeEventStream({
  logs,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  loading,
  hasFilters,
  newEventIds,
  className,
}: {
  logs: RuntimeLogEvent[];
  selectedId: string | null;
  onSelect: (log: RuntimeLogEvent) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  hasFilters?: boolean;
  newEventIds?: Set<string>;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [pendingNew, setPendingNew] = useState(0);
  const prevTopId = useRef<string | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearTop = el.scrollTop < 48;
      setStuck(!nearTop);
      if (nearTop) setPendingNew(0);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const topId = logs[0]?.id ?? null;
    if (!topId || topId === prevTopId.current) return;

    if (prevTopId.current && listRef.current) {
      if (stuck) setPendingNew((n) => n + 1);
      else listRef.current.scrollTop = 0;
    }
    prevTopId.current = topId;
  }, [logs, stuck]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search runtime activity…"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={listRef} className="h-full overflow-y-auto pr-1 [scrollbar-width:thin]">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading runtime activity…
            </p>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">
                {hasFilters ? "No matching activity" : "No recent activity"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Your Personal OS hasn't reported any runtime activity in the last 15 minutes."}
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 pb-4">
              {logs.map((log) => (
                <li key={log.id}>
                  <RuntimeEventRow
                    log={log}
                    selected={selectedId === log.id}
                    onSelect={() => onSelect(log)}
                    isNew={newEventIds?.has(log.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {pendingNew > 0 ? (
          <button
            type="button"
            className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-hairline bg-background/95 px-3 py-1 text-xs shadow-sm backdrop-blur-sm"
            onClick={() => {
              listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              setPendingNew(0);
              setStuck(false);
            }}
          >
            ↑ {pendingNew} new event{pendingNew === 1 ? "" : "s"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
