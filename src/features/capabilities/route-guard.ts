import type { QueryClient } from "@tanstack/react-query";
import { isRedirect, redirect } from "@tanstack/react-router";
import {
  hasRequiredPermission,
  logAuthDecision,
  permissionsSource,
  resolveCapabilitiesForGuard,
} from "@/features/capabilities/resolve-capabilities";
import { ApiRequestError } from "@/lib/api/errors";
import type { PermissionKey } from "@/lib/permissions";

function isAuthTransportError(error: ApiRequestError): boolean {
  return (
    error.kind === "network" ||
    error.kind === "timeout" ||
    error.kind === "server" ||
    error.status >= 500
  );
}

export function requirePermissions(permissions: PermissionKey | PermissionKey[]) {
  const keys = Array.isArray(permissions) ? permissions : [permissions];

  return async ({
    context,
    location,
  }: {
    context: { queryClient: QueryClient };
    location: { pathname: string };
  }) => {
    const route = location.pathname;

    try {
      const caps = await resolveCapabilitiesForGuard(context.queryClient);
      const allowed = hasRequiredPermission(caps, keys);

      logAuthDecision({
        route,
        required: keys,
        result: allowed ? "allowed" : "denied",
        authState: "ready",
        permissionsSource: permissionsSource(context.queryClient, caps),
        redirectReason: allowed ? undefined : "missing_permission",
      });

      if (!allowed) {
        throw redirect({ to: "/access-restricted" });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;

      if (error instanceof ApiRequestError) {
        logAuthDecision({
          route,
          required: keys,
          result: "error",
          authState: "ready",
          permissionsSource: "fetched",
          errorKind: error.kind,
          redirectReason:
            error.status === 403
              ? "capabilities_forbidden"
              : error.status === 401
                ? "session_expired"
                : "transport_error",
        });

        if (error.status === 401) throw error;
        if (error.status === 403) throw redirect({ to: "/access-restricted" });
        if (isAuthTransportError(error)) throw error;
        throw error;
      }

      logAuthDecision({
        route,
        required: keys,
        result: "error",
        authState: "ready",
        permissionsSource: "fetched",
        redirectReason: "unknown_error",
      });
      throw error;
    }
  };
}
