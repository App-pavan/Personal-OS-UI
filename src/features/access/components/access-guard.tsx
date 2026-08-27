import type { ReactNode } from "react";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { AdminApiUnavailable } from "@/features/access/components/admin-api-unavailable";
import { UnauthorizedAccess } from "@/features/access/components/unauthorized-access";
import { useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import { useAdminApiProbe } from "@/hooks/use-rbac";
import { isNotFoundError } from "@/lib/api/errors";

export function AccessGuard({ children }: { children: ReactNode }) {
  const { isLoading, isReady, canViewAccessControl } = useAccessControlPermissions();
  const probe = useAdminApiProbe();

  if (!isReady || isLoading) return <RowsSkeleton rows={6} />;
  if (!canViewAccessControl) return <UnauthorizedAccess />;

  if (probe.isLoading) return <RowsSkeleton rows={6} />;
  if (probe.isError && isNotFoundError(probe.error)) return <AdminApiUnavailable />;
  if (probe.isError) {
    return <ErrorState error={probe.error} onRetry={() => void probe.refetch()} />;
  }

  return <>{children}</>;
}
