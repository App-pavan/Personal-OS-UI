import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { grantedPermissions } from "@/lib/api/rbac-normalize";

let cached: CapabilitiesResponse | null = null;
let ownerUserId: string | null = null;

export function setCapabilityStore(userId: string | null, caps: CapabilitiesResponse | null) {
  ownerUserId = userId;
  cached = caps;
}

export function clearCapabilityStore() {
  ownerUserId = null;
  cached = null;
}

export function getCapabilityStore(): CapabilitiesResponse | null {
  return cached;
}

export function getCapabilityUserId(): string | null {
  return ownerUserId;
}

export function canSync(permission: string): boolean {
  if (!cached) return false;
  return grantedPermissions(cached).includes(permission);
}

export function canAnySync(permissions: string[]): boolean {
  return permissions.some((p) => canSync(p));
}
