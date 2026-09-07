import type { ReactNode } from "react";
import { HudPanel } from "@/components/future";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { cn } from "@/lib/utils";

export function DashboardWidget({
  children,
  className,
  loading,
  error,
  onRetry,
  errorTitle,
  skeletonRows = 3,
  empty,
}: {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  errorTitle?: string;
  skeletonRows?: number;
  empty?: ReactNode;
}) {
  if (error) {
    return (
      <div className={className}>
        <ErrorState
          error={error}
          {...(onRetry ? { onRetry } : {})}
          title={errorTitle ?? "Data unavailable"}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <HudPanel className={cn("min-h-[140px]", className)}>
        <RowsSkeleton rows={skeletonRows} />
      </HudPanel>
    );
  }

  if (empty) {
    return <div className={className}>{empty}</div>;
  }

  return <div className={className}>{children}</div>;
}
