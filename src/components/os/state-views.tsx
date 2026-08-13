import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { FuturisticButton, FuturisticEmpty, ScanSkeleton } from "@/components/future";
import { ApiRequestError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/* Shared loading / empty / error / retry surfaces for API-backed screens. */

export function Skeleton({ className }: { className?: string }) {
  return <ScanSkeleton className={cn("h-4", className)} />;
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
  title = "System connection interrupted",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const offline = error instanceof ApiRequestError && error.kind === "network";
  const message =
    error instanceof ApiRequestError ? error.message : "Unable to retrieve data from the backend.";

  return (
    <div className="hud-panel angular-clip flex flex-col items-start gap-4 p-6">
      <div className="relative z-[1] flex flex-col items-start gap-4">
        <span className="grid size-10 place-items-center angular-clip-sm border border-destructive/30 bg-destructive/10 text-accent">
          {offline ? <WifiOff className="size-4" /> : <AlertTriangle className="size-4" />}
        </span>
        <div>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {offline ? "Network offline" : "Connection error"}
          </p>
          <p className="mt-1 text-sm font-medium">{offline ? "Network unavailable" : title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry ? (
          <FuturisticButton variant="ghost" onClick={onRetry} className="text-xs">
            <RefreshCw className="size-3.5" /> Retry connection
          </FuturisticButton>
        ) : null}
      </div>
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
    <FuturisticEmpty
      title={title}
      line={line}
      action={action}
      icon={icon ?? <Inbox className="size-5" />}
    />
  );
}

/** Honest placeholder for modules whose backend doesn't exist yet. */
export function FutureState({ title, line }: { title: string; line: string }) {
  return (
    <div className="hud-panel angular-clip p-5">
      <div className="relative z-[1]">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          <span className="border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground angular-clip-sm">
            Not connected yet
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{line}</p>
      </div>
    </div>
  );
}
