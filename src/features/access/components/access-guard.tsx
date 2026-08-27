import type { ReactNode } from "react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { UnauthorizedAccess } from "./unauthorized-access";

export function AccessGuard({ children }: { children: ReactNode }) {
  const { isLoading, isError, error, refetch, canViewAccessControl } = useCapabilities();

  if (isLoading) return <RowsSkeleton rows={6} />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!canViewAccessControl) return <UnauthorizedAccess />;

  return <>{children}</>;
}
