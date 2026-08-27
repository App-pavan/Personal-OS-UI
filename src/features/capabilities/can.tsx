import type { ReactNode } from "react";
import { useCapabilities } from "@/features/capabilities/capabilities-context";

type CanProps = {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
};

/** Renders children only when the current user has the required permission(s). */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can, canAny } = useCapabilities();
  const allowed = Array.isArray(permission) ? canAny(permission) : can(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function useCan() {
  const { can, canAny } = useCapabilities();
  return { can, canAny };
}
