import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Filter, PanelRightOpen } from "lucide-react";
import { ModuleHeader } from "@/components/os/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRuntimeActivityPage } from "@/hooks/use-runtime-activity";
import {
  RuntimeFilterPanel,
  RuntimeFollowingBanner,
} from "@/features/runtime/components/runtime-filter-panel";
import { RuntimeEventStream } from "@/features/runtime/components/runtime-event-stream";
import { RuntimeEventDetails } from "@/features/runtime/components/runtime-event-details";
import {
  RuntimeConnectionBanner,
  RuntimeLiveIndicator,
} from "@/features/runtime/components/runtime-live-indicator";
import { RuntimeSummaryStrip } from "@/features/runtime/components/runtime-summary-strip";
import type { ActivitySearchParams } from "@/features/runtime/lib/activity-utils";
import { humanizeToken, computeSummary } from "@/features/runtime/lib/activity-utils";
import type { RuntimeLogEvent, RuntimeOperation } from "@/lib/api/runtime-types";
import { cn } from "@/lib/utils";

export function RuntimeActivityPage({
  search,
  routePath,
}: {
  search: ActivitySearchParams;
  routePath: string;
}) {
  const navigate = useNavigate({ from: routePath as "/" });
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  const [selectedEvent, setSelectedEvent] = useState<RuntimeLogEvent | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const seenIds = useRef(new Set<string>());
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());

  const params = search;
  const {
    logs,
    operations,
    activeOperations,
    summary: _summary,
    services,
    providers,
    operationTypes,
    retentionMinutes,
    status,
    initialLoading,
    reconnect,
  } = useRuntimeActivityPage(params);

  useEffect(() => {
    for (const log of logs) {
      if (!seenIds.current.has(log.id)) {
        seenIds.current.add(log.id);
        if (!initialLoading) {
          setNewEventIds((prev) => new Set(prev).add(log.id));
          setTimeout(() => {
            setNewEventIds((prev) => {
              const next = new Set(prev);
              next.delete(log.id);
              return next;
            });
          }, 1200);
        }
      }
    }
  }, [logs, initialLoading]);

  useEffect(() => {
    if (search.eventId && logs.length) {
      const match = logs.find((l) => l.id === search.eventId);
      if (match) setSelectedEvent(match);
    }
  }, [search.eventId, logs]);

  const selectedOperation = useMemo(() => {
    if (!selectedEvent?.correlationId) return activeOperations[0] ?? null;
    return (
      operations.find((op) => op.correlationId === selectedEvent.correlationId) ??
      activeOperations.find((op) => op.correlationId === selectedEvent.correlationId) ??
      null
    );
  }, [selectedEvent, operations, activeOperations]);

  const summary = useMemo(() => computeSummary(logs, operations), [logs, operations]);

  const hasFilters = Boolean(
    params.service ||
    params.provider ||
    params.operation ||
    params.correlationId ||
    (params.level && params.level !== "all") ||
    (params.status && params.status !== "all") ||
    (params.minutes && params.minutes !== 15) ||
    params.q,
  );

  const patchSearch = useCallback(
    (patch: Partial<ActivitySearchParams>) => {
      navigate({
        search: (prev) => {
          const next = { ...prev, ...patch };
          for (const key of Object.keys(patch) as (keyof ActivitySearchParams)[]) {
            if (patch[key] === undefined) delete next[key];
          }
          return next;
        },
      });
    },
    [navigate],
  );

  const resetFilters = useCallback(() => {
    navigate({ search: {} });
  }, [navigate]);

  const handleSelectEvent = (log: RuntimeLogEvent) => {
    setSelectedEvent(log);
    if (!isDesktop) setDetailsOpen(true);
    patchSearch({ eventId: log.id });
  };

  const handleFollowCorrelation = (correlationId: string) => {
    patchSearch({ correlationId, eventId: undefined });
  };

  const handleSelectOperation = (op: RuntimeOperation) => {
    if (op.correlationId) patchSearch({ correlationId: op.correlationId });
    const related = logs.find((l) => l.correlationId === op.correlationId);
    if (related) handleSelectEvent(related);
  };

  const followingLabel = useMemo(() => {
    if (!params.correlationId) return undefined;
    const op = operations.find((o) => o.correlationId === params.correlationId);
    return op ? humanizeToken(op.type) : params.correlationId;
  }, [params.correlationId, operations]);

  const filterPanel = (
    <RuntimeFilterPanel
      params={params}
      services={services}
      providers={providers}
      operationTypes={operationTypes}
      onChange={patchSearch}
      onReset={resetFilters}
    />
  );

  const detailsPanel = (
    <RuntimeEventDetails
      event={selectedEvent}
      operation={selectedOperation}
      activeOperations={activeOperations}
      onFollowCorrelation={handleFollowCorrelation}
      onSelectOperation={handleSelectOperation}
      followingCorrelationId={params.correlationId}
    />
  );

  return (
    <div className="mx-auto w-full max-w-none space-y-8 md:space-y-10">
      <ModuleHeader
        eyebrow="Runtime activity"
        moduleCode="SYS"
        title="Runtime activity"
        description="Live operational activity across your Personal OS."
        actions={
          <RuntimeLiveIndicator
            status={status}
            retentionMinutes={retentionMinutes}
            onRetry={reconnect}
          />
        }
      />

      <RuntimeConnectionBanner status={status} onRetry={reconnect} />

      {params.correlationId ? (
        <RuntimeFollowingBanner
          correlationId={params.correlationId}
          label={followingLabel}
          onClear={() => patchSearch({ correlationId: undefined })}
        />
      ) : null}

      <RuntimeSummaryStrip
        running={summary.running}
        errors={summary.errors}
        warnings={summary.warnings}
        events={summary.events}
        className="animate-rise"
      />

      <div className="animate-rise surface-raised min-h-[calc(100vh-16rem)] overflow-hidden border border-hairline/60">
        <div className="flex items-center gap-2 border-b border-hairline/60 px-3 py-2 md:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Filter className="size-3.5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,320px)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              {filterPanel}
            </SheetContent>
          </Sheet>

          <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <PanelRightOpen className="size-3.5" />
                Details
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,380px)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Event details</SheetTitle>
              </SheetHeader>
              {detailsPanel}
            </SheetContent>
          </Sheet>
        </div>

        <div
          className={cn(
            "grid min-h-[calc(100vh-18rem)]",
            isDesktop
              ? "grid-cols-[240px_minmax(0,1fr)_320px]"
              : isTablet
                ? "grid-cols-[minmax(0,1fr)]"
                : "grid-cols-1",
          )}
        >
          {isDesktop ? (
            <div className="border-r border-hairline/60 bg-background/40">{filterPanel}</div>
          ) : null}

          <div className="flex min-h-0 flex-col p-4">
            <RuntimeEventStream
              logs={logs}
              selectedId={selectedEvent?.id ?? null}
              onSelect={handleSelectEvent}
              search={params.q ?? ""}
              onSearchChange={(q) => patchSearch({ q: q || undefined })}
              loading={initialLoading}
              hasFilters={hasFilters}
              newEventIds={newEventIds}
            />
          </div>

          {isDesktop ? (
            <div className="border-l border-hairline/60 bg-background/40">{detailsPanel}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
