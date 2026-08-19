import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SemanticBadge } from "@/components/future";
import { cn } from "@/lib/utils";
import type { RuntimeLogEvent, RuntimeOperation } from "@/lib/api/runtime-types";
import {
  copyText,
  eventVisualLevel,
  formatEventDateTime,
  humanizeToken,
  providerLabel,
  serviceLabel,
  truncateId,
} from "@/features/runtime/lib/activity-utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5">
      <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <div className="min-w-0 text-sm">{value}</div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      title={`Copy ${label}`}
      onClick={() => {
        void copyText(value).then((ok) => {
          if (!ok) return;
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function formatMetadataValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function MetadataSection({ metadata }: { metadata: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(metadata).filter(([, v]) => v != null);

  if (!entries.length) return null;

  const simple = entries.filter(([, v]) => typeof v !== "object");
  const complex = entries.filter(([, v]) => typeof v === "object");

  return (
    <div className="space-y-2 border-t border-hairline/60 pt-3">
      <p className="label-eyebrow">Metadata</p>
      <div className="space-y-0.5">
        {simple.map(([key, value]) => (
          <DetailRow key={key} label={humanizeToken(key)} value={formatMetadataValue(value)} />
        ))}
      </div>
      {complex.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-primary underline-offset-2 hover:underline"
          >
            {expanded ? "Hide metadata" : "View metadata"}
          </button>
          {expanded ? (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-hairline/60 bg-muted/20 p-2 text-[10px] leading-relaxed text-muted-foreground">
              {JSON.stringify(Object.fromEntries(complex), null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ActiveOperationCard({
  operation,
  selected,
  onSelect,
}: {
  operation: RuntimeOperation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-left transition",
        selected ? "border-primary/30 bg-primary/5" : "border-hairline/60 hover:bg-muted/20",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
        <p className="text-sm font-medium">{humanizeToken(operation.type)}</p>
      </div>
      {operation.provider ? (
        <p className="mt-1 text-xs text-muted-foreground">{providerLabel(operation.provider)}</p>
      ) : null}
      {operation.currentStep ? (
        <p className="mt-1 text-xs tone-info-text">{humanizeToken(operation.currentStep)}</p>
      ) : null}
    </button>
  );
}

export function RuntimeEventDetails({
  event,
  operation,
  activeOperations,
  onFollowCorrelation,
  onSelectOperation,
  followingCorrelationId,
  className,
}: {
  event: RuntimeLogEvent | null;
  operation: RuntimeOperation | null;
  activeOperations: RuntimeOperation[];
  onFollowCorrelation?: (correlationId: string) => void;
  onSelectOperation?: (operation: RuntimeOperation) => void;
  followingCorrelationId?: string;
  className?: string;
}) {
  if (!event && activeOperations.length === 0) {
    return (
      <aside className={cn("flex h-full items-center justify-center p-6 text-center", className)}>
        <div>
          <p className="text-sm font-medium">Event details</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Select an event from the stream to inspect it.
          </p>
        </div>
      </aside>
    );
  }

  const visual = event ? eventVisualLevel(event) : null;

  return (
    <aside className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="border-b border-hairline/60 px-4 py-3">
        <p className="label-eyebrow">Details</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {activeOperations.length > 0 ? (
          <div className="space-y-2">
            <p className="label-eyebrow">Active operations</p>
            <div className="space-y-2">
              {activeOperations.map((op) => (
                <ActiveOperationCard
                  key={op.operationId}
                  operation={op}
                  selected={operation?.operationId === op.operationId}
                  onSelect={() => onSelectOperation?.(op)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {operation ? (
          <div className="space-y-2 rounded-md border border-hairline/60 bg-muted/10 p-3">
            <p className="label-eyebrow">Operation</p>
            <div className="flex items-center gap-2">
              <SemanticBadge tone={operation.status === "RUNNING" ? "info" : operation.status === "FAILED" ? "danger" : "success"} dot={operation.status === "RUNNING"}>
                {humanizeToken(operation.type)}
              </SemanticBadge>
              <span className="text-[10px] text-muted-foreground uppercase">{operation.status}</span>
            </div>
            {operation.currentStep ? (
              <DetailRow label="Current step" value={humanizeToken(operation.currentStep)} />
            ) : null}
            <DetailRow label="Started" value={formatEventDateTime(operation.startedAt)} />
            {operation.durationMs != null ? (
              <DetailRow label="Duration" value={`${Math.round(operation.durationMs / 1000)}s`} />
            ) : null}
            {operation.provider ? (
              <DetailRow label="Provider" value={providerLabel(operation.provider)} />
            ) : null}
            {operation.error?.message ? (
              <p className="text-xs tone-danger-text">{operation.error.message}</p>
            ) : null}
          </div>
        ) : null}

        {event ? (
          <div className="space-y-1">
            <p className="label-eyebrow">Event details</p>
            <p className="font-mono text-sm tracking-wide uppercase">{humanizeToken(event.event)}</p>

            <DetailRow label="Time" value={formatEventDateTime(event.timestamp)} />
            <DetailRow
              label="Level"
              value={
                visual ? (
                  <SemanticBadge tone={visual === "SUCCESS" ? "success" : visual === "ERROR" ? "danger" : visual === "WARN" ? "warning" : "info"}>
                    {visual}
                  </SemanticBadge>
                ) : null
              }
            />
            <DetailRow label="Service" value={event.service ? serviceLabel(event.service) : null} />
            <DetailRow label="Module" value={event.module ? humanizeToken(event.module) : null} />
            <DetailRow label="Operation" value={event.operation ? humanizeToken(event.operation) : null} />
            <DetailRow label="Provider" value={event.provider ? providerLabel(event.provider) : null} />
            {event.durationMs != null ? (
              <DetailRow label="Duration" value={`${event.durationMs}ms`} />
            ) : null}
            {event.requestId ? (
              <DetailRow
                label="Request ID"
                value={
                  <span className="inline-flex items-center gap-2 font-mono text-xs">
                    {truncateId(event.requestId, 12)}
                    <CopyButton value={event.requestId} label="request ID" />
                  </span>
                }
              />
            ) : null}
            {event.correlationId ? (
              <DetailRow
                label="Correlation"
                value={
                  <span className="inline-flex flex-wrap items-center gap-2 font-mono text-xs">
                    {truncateId(event.correlationId, 12)}
                    <CopyButton value={event.correlationId} label="correlation ID" />
                    {onFollowCorrelation && event.correlationId !== followingCorrelationId ? (
                      <button
                        type="button"
                        onClick={() => onFollowCorrelation(event.correlationId!)}
                        className="text-[11px] text-primary underline-offset-2 hover:underline"
                      >
                        Follow
                      </button>
                    ) : null}
                  </span>
                }
              />
            ) : null}
            {event.id ? (
              <DetailRow
                label="Event ID"
                value={
                  <span className="inline-flex items-center gap-2 font-mono text-xs">
                    {truncateId(event.id, 12)}
                    <CopyButton value={event.id} label="event ID" />
                  </span>
                }
              />
            ) : null}

            {event.error ? (
              <div className="space-y-1 border-t border-hairline/60 pt-3">
                <p className="label-eyebrow">Error details</p>
                {event.error.name ? (
                  <DetailRow label="Type" value={event.error.name} />
                ) : null}
                {event.error.code ? (
                  <DetailRow label="Code" value={event.error.code} />
                ) : null}
                {event.error.message ? (
                  <DetailRow label="Message" value={event.error.message} />
                ) : null}
              </div>
            ) : null}

            {event.metadata ? <MetadataSection metadata={event.metadata} /> : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
