import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RuntimeLogViewer } from "./runtime-log-viewer";
import { RuntimeOperationsList } from "./runtime-operation-card";
import {
  useRuntimeLogs,
  useRuntimeOperations,
  type RuntimeLevelFilter,
} from "@/hooks/use-runtime-logs";
import type { RuntimeLogFilter } from "@/lib/api/runtime-types";

function filterKey(filter: RuntimeLogFilter): string {
  return JSON.stringify(filter);
}

export function RuntimeActivitySheet({
  open,
  onOpenChange,
  filter,
  title = "Runtime activity",
  description = "Live operational events from the last 15 minutes.",
  showOperations = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter?: RuntimeLogFilter;
  title?: string;
  description?: string;
  showOperations?: boolean;
}) {
  const [levelFilter, setLevelFilter] = useState<RuntimeLevelFilter>("all");
  const [search, setSearch] = useState("");

  const stableFilter = useMemo(() => filter ?? {}, [filterKey(filter ?? {})]);

  const { logs, retentionMinutes, status, reconnect } = useRuntimeLogs({
    filter: stableFilter,
    enabled: open,
    levelFilter,
    search,
  });

  const { operations } = useRuntimeOperations({ enabled: open && showOperations, pollMs: 2500 });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pt-2">
          {showOperations ? (
            <RuntimeOperationsList
              operations={operations}
              filterCorrelationId={stableFilter.correlationId}
            />
          ) : null}

          <RuntimeLogViewer
            logs={logs}
            retentionMinutes={retentionMinutes}
            status={status}
            onReconnect={reconnect}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            search={search}
            onSearchChange={setSearch}
            className="min-h-0 flex-1"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
