import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { ApiRequestError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/* Shared loading / empty / error / retry surfaces for API-backed screens. */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted/70", className)} />;
}

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="hairline-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3.5">
          <Skeleton className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[min(62%,320px)]" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = "Something didn't load",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const offline = error instanceof ApiRequestError && error.kind === "network";
  const message =
    error instanceof ApiRequestError ? error.message : "The backend didn't respond as expected.";

  return (
    <div className="surface-quiet flex flex-col items-start gap-3 p-6">
      <span className="grid size-9 place-items-center rounded-lg bg-destructive/10 text-destructive">
        {offline ? <WifiOff className="size-4" /> : <AlertTriangle className="size-4" />}
      </span>
      <div>
        <p className="text-sm font-medium">{offline ? "Network unavailable" : title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium transition hover:bg-muted/70"
        >
          <RefreshCw className="size-3.5" /> Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  line,
  action,
  icon,
}: {
  title: string;
  line: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
        {icon ?? <Inbox className="size-4" />}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{line}</p>
      </div>
      {action}
    </div>
  );
}

/** Honest placeholder for modules whose backend doesn't exist yet. */
export function FutureState({ title, line }: { title: string; line: string }) {
  return (
    <div className="surface-quiet p-5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Not connected yet
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{line}</p>
    </div>
  );
}
