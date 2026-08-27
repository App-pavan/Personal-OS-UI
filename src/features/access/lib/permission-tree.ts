import type { PermissionDefinition } from "@/lib/api/rbac-types";

export type PermissionAction = {
  key: string;
  action: string;
  description: string;
};

export type PermissionFeature = {
  key: string;
  label: string;
  actions: PermissionAction[];
};

export type PermissionModule = {
  key: string;
  label: string;
  features: PermissionFeature[];
};

const MODULE_LABELS: Record<string, string> = {
  tasks: "Tasks",
  checklists: "Checklists",
  expenses: "Expenses",
  wealth: "Wealth",
  system: "Runtime Activity",
  settings: "Settings",
  communication: "Communication",
  device_awareness: "Device Awareness",
};

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  manage: "Manage",
  configure: "Configure",
  assign: "Assign",
  bulk: "Bulk",
};

export function moduleLabel(module: string): string {
  return MODULE_LABELS[module] ?? formatLabel(module);
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? formatLabel(action);
}

export function formatLabel(value: string): string {
  return value
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Build module → feature → action hierarchy from backend permission metadata. */
export function buildPermissionTree(definitions: PermissionDefinition[]): PermissionModule[] {
  const modules = new Map<string, Map<string, PermissionAction[]>>();

  for (const def of definitions) {
    if (!modules.has(def.module)) modules.set(def.module, new Map());
    const features = modules.get(def.module)!;
    if (!features.has(def.feature)) features.set(def.feature, []);
    features.get(def.feature)!.push({
      key: def.key,
      action: def.action,
      description: def.description,
    });
  }

  return [...modules.entries()]
    .sort(([a], [b]) => moduleLabel(a).localeCompare(moduleLabel(b)))
    .map(([moduleKey, featureMap]) => ({
      key: moduleKey,
      label: moduleLabel(moduleKey),
      features: [...featureMap.entries()]
        .sort(([a], [b]) => formatLabel(a).localeCompare(formatLabel(b)))
        .map(([featureKey, actions]) => ({
          key: featureKey,
          label: formatLabel(featureKey),
          actions: actions.sort((a, b) =>
            actionLabel(a.action).localeCompare(actionLabel(b.action)),
          ),
        })),
    }));
}

/** Derive effective permissions from a set of role permission lists. */
export function unionPermissions(...sets: string[][]): string[] {
  const seen = new Set<string>();
  for (const set of sets) {
    for (const key of set) seen.add(key);
  }
  return [...seen].sort();
}

/** Check whether a module has any granted permission. */
export function moduleHasAccess(moduleKey: string, granted: Set<string>): boolean {
  for (const key of granted) {
    if (key.startsWith(`${moduleKey}.`) || key.split(".")[0] === moduleKey) return true;
  }
  return false;
}

/** Collect all permission keys under a module from the catalog. */
export function modulePermissionKeys(module: PermissionModule): string[] {
  return module.features.flatMap((f) => f.actions.map((a) => a.key));
}
