import type { ReactNode } from "react";
import { PERM } from "@/lib/permissions";

export type DashboardWidgetDef = {
  key: string;
  requiredPermission: string | string[];
  component: () => ReactNode;
};

/** Widget registry — dashboard renders only widgets the user can access. */
export const DASHBOARD_WIDGETS: Omit<DashboardWidgetDef, "component">[] = [
  { key: "tasks_focus", requiredPermission: PERM.TASKS_VIEW },
  { key: "checklists_running", requiredPermission: PERM.CHECKLISTS_VIEW },
  { key: "expenses_summary", requiredPermission: PERM.EXPENSES_TRANSACTIONS_VIEW },
  { key: "wealth_summary", requiredPermission: PERM.WEALTH_PORTFOLIO_VIEW },
];

export function widgetVisible(
  can: (p: string) => boolean,
  canAny: (p: string[]) => boolean,
  widget: { requiredPermission: string | string[] },
): boolean {
  const keys = Array.isArray(widget.requiredPermission)
    ? widget.requiredPermission
    : [widget.requiredPermission];
  return canAny(keys);
}
