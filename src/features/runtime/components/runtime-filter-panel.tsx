import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ActivityLevelFilter,
  ActivitySearchParams,
  ActivityStatusFilter,
  ActivityTimeRange,
} from "@/features/runtime/lib/activity-utils";
import { humanizeToken, providerLabel, serviceLabel } from "@/features/runtime/lib/activity-utils";

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="label-eyebrow">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterOption({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50",
      )}
    >
      <span>{label}</span>
      {count != null ? (
        <span className="font-mono text-[10px] tabular-nums opacity-70">{count}</span>
      ) : null}
    </button>
  );
}

export function RuntimeFilterPanel({
  params,
  services,
  providers,
  operationTypes,
  onChange,
  onReset,
  className,
}: {
  params: ActivitySearchParams;
  services: string[];
  providers: string[];
  operationTypes: string[];
  onChange: (patch: Partial<ActivitySearchParams>) => void;
  onReset: () => void;
  className?: string;
}) {
  const level = params.level ?? "all";
  const status = params.status ?? "all";
  const minutes = params.minutes ?? 15;

  const levelOptions: { value: ActivityLevelFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "INFO", label: "Info" },
    { value: "WARN", label: "Warnings" },
    { value: "ERROR", label: "Errors" },
    { value: "DEBUG", label: "Debug" },
  ];

  const timeOptions: { value: ActivityTimeRange; label: string }[] = [
    { value: 5, label: "Last 5 minutes" },
    { value: 10, label: "Last 10 minutes" },
    { value: 15, label: "Last 15 minutes" },
  ];

  const statusOptions: { value: ActivityStatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "RUNNING", label: "Running" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
  ];

  return (
    <aside className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-hairline/60 px-3 py-3">
        <p className="label-eyebrow">Filters</p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
        <FilterSection title="Time range">
          {timeOptions.map((opt) => (
            <FilterOption
              key={opt.value}
              active={minutes === opt.value}
              label={opt.label}
              onClick={() => onChange({ minutes: opt.value })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Activity">
          {levelOptions.map((opt) => (
            <FilterOption
              key={opt.value}
              active={level === opt.value}
              label={opt.label}
              onClick={() => onChange({ level: opt.value })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Service">
          <FilterOption
            active={!params.service || params.service === "all"}
            label="All"
            onClick={() => onChange({ service: undefined })}
          />
          {services.map((svc) => (
            <FilterOption
              key={svc}
              active={params.service === svc}
              label={serviceLabel(svc)}
              onClick={() => onChange({ service: svc })}
            />
          ))}
        </FilterSection>

        {providers.length > 0 ? (
          <FilterSection title="Provider">
            <FilterOption
              active={!params.provider || params.provider === "all"}
              label="All"
              onClick={() => onChange({ provider: undefined })}
            />
            {providers.map((p) => (
              <FilterOption
                key={p}
                active={params.provider === p}
                label={providerLabel(p)}
                onClick={() => onChange({ provider: p })}
              />
            ))}
          </FilterSection>
        ) : null}

        {operationTypes.length > 0 ? (
          <FilterSection title="Operation">
            <FilterOption
              active={!params.operation || params.operation === "all"}
              label="All"
              onClick={() => onChange({ operation: undefined })}
            />
            {operationTypes.map((op) => (
              <FilterOption
                key={op}
                active={params.operation === op}
                label={humanizeToken(op)}
                onClick={() => onChange({ operation: op })}
              />
            ))}
          </FilterSection>
        ) : null}

        <FilterSection title="Status">
          {statusOptions.map((opt) => (
            <FilterOption
              key={opt.value}
              active={status === opt.value}
              label={opt.label}
              onClick={() => onChange({ status: opt.value })}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

export function RuntimeFollowingBanner({
  correlationId,
  label,
  onClear,
}: {
  correlationId: string;
  label?: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-xs">
      <div>
        <p className="text-[10px] tracking-[0.16em] text-primary uppercase">Following</p>
        <p className="mt-0.5 font-medium">{label ?? correlationId}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-primary underline-offset-2 hover:underline"
      >
        Clear
      </button>
    </div>
  );
}
