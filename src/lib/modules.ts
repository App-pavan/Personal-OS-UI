import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  LayoutGrid,
  ListChecks,
  Radio,
  Settings,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { grantedPermissions } from "@/lib/api/rbac-normalize";
import { ACCESS_CONTROL_PERMISSIONS, PERM, type PermissionKey } from "@/lib/permissions";

export type AppRoute =
  | "/"
  | "/tasks"
  | "/checklists"
  | "/expenses"
  | "/wealth"
  | "/settings"
  | "/system/activity"
  | "/devices";

export type ModuleDef = {
  key: string;
  label: string;
  to: AppRoute;
  icon: LucideIcon;
  group: "core" | "system";
  blurb: string;
  /** Module visible when user has this permission (or any in the array). */
  requiredPermission: PermissionKey | PermissionKey[];
  /** When false, excluded from navigation until the route is implemented. */
  implemented?: boolean;
};

function canAny(caps: CapabilitiesResponse | undefined, keys: PermissionKey[]): boolean {
  if (!caps) return false;
  const granted = new Set(grantedPermissions(caps));
  return keys.some((k) => granted.has(k));
}

function moduleVisible(caps: CapabilitiesResponse | undefined, mod: ModuleDef): boolean {
  if (mod.implemented === false) return false;
  if (mod.key === "home" || mod.key === "settings") return true;
  const keys = Array.isArray(mod.requiredPermission)
    ? mod.requiredPermission
    : [mod.requiredPermission];
  return canAny(caps, keys);
}

/** Authoritative module registry — navigation derives from capabilities × this list. */
export const MODULE_REGISTRY: ModuleDef[] = [
  {
    key: "tasks",
    label: "Tasks",
    to: "/tasks",
    icon: ListChecks,
    group: "core",
    blurb: "Everything you owe yourself",
    requiredPermission: PERM.TASKS_VIEW,
  },
  {
    key: "checklists",
    label: "Checklists",
    to: "/checklists",
    icon: ClipboardCheck,
    group: "core",
    blurb: "Routines you repeat",
    requiredPermission: PERM.CHECKLISTS_VIEW,
  },
  {
    key: "expenses",
    label: "Expenses",
    to: "/expenses",
    icon: Wallet,
    group: "core",
    blurb: "Spending and budgets",
    requiredPermission: PERM.EXPENSES_TRANSACTIONS_VIEW,
  },
  {
    key: "wealth",
    label: "Wealth",
    to: "/wealth",
    icon: TrendingUp,
    group: "core",
    blurb: "Investments and portfolio",
    requiredPermission: PERM.WEALTH_PORTFOLIO_VIEW,
  },
  {
    key: "device_awareness",
    label: "Device Awareness",
    to: "/devices",
    icon: Smartphone,
    group: "core",
    blurb: "Family devices and presence",
    requiredPermission: PERM.DEVICE_AWARENESS_DEVICES_VIEW,
  },
  {
    key: "settings",
    label: "Settings",
    to: "/settings",
    icon: Settings,
    group: "system",
    blurb: "Preferences",
    requiredPermission: PERM.TASKS_VIEW,
  },
  {
    key: "runtime",
    label: "Runtime",
    to: "/system/activity",
    icon: Radio,
    group: "system",
    blurb: "Live system activity",
    requiredPermission: PERM.SYSTEM_RUNTIME_VIEW,
  },
];

export function visibleModules(caps: CapabilitiesResponse | undefined): ModuleDef[] {
  const home: ModuleDef = {
    key: "home",
    label: "Home",
    to: "/",
    icon: LayoutGrid,
    group: "core",
    blurb: "Your day, composed",
    requiredPermission: PERM.TASKS_VIEW,
  };
  const rest = MODULE_REGISTRY.filter((m) => moduleVisible(caps, m));
  return [home, ...rest];
}

export function canAccessRoute(caps: CapabilitiesResponse | undefined, pathname: string): boolean {
  if (pathname === "/" || pathname.startsWith("/access-restricted")) return true;
  if (pathname.startsWith("/settings/access")) {
    return canAny(caps, [...ACCESS_CONTROL_PERMISSIONS]);
  }
  if (pathname.startsWith("/settings")) return true;

  const mod = MODULE_REGISTRY.find(
    (m) => m.implemented !== false && (pathname === m.to || pathname.startsWith(`${m.to}/`)),
  );
  if (!mod) return true;
  return moduleVisible(caps, mod);
}

export function routePermission(pathname: string): PermissionKey | PermissionKey[] | null {
  if (pathname.startsWith("/settings/access")) return [...ACCESS_CONTROL_PERMISSIONS];
  if (pathname.startsWith("/settings")) return null;
  if (pathname === "/") return null;

  const mod = MODULE_REGISTRY.find(
    (m) => m.implemented !== false && (pathname === m.to || pathname.startsWith(`${m.to}/`)),
  );
  return mod?.requiredPermission ?? null;
}

export function navIsActive(pathname: string, to: AppRoute) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** @deprecated Use visibleModules(caps) — kept for gradual migration */
export const modules = MODULE_REGISTRY.filter((m) => m.implemented !== false);

export const primaryNav = modules;
