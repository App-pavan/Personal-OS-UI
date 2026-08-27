import type { ReactNode } from "react";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import { UnauthorizedAccess } from "./unauthorized-access";

export function AccessGuard({ children }: { children: ReactNode }) {
  const { isLoading, isError, error, refetch, canViewAccessControl } =
    useAccessControlPermissions();

  if (isLoading) return <RowsSkeleton rows={6} />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!canViewAccessControl) return <UnauthorizedAccess />;

  return <>{children}</>;
}
