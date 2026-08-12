import { ClipboardCheck, LayoutGrid, ListChecks, Settings, Wallet } from "lucide-react";

/**
 * Primary navigation.
 *
 * Only modules with real backend capability appear here. Future
 * modules arrive when their API does — no placeholder entries.
 */
export type ModuleDef = {
  label: string;
  to: "/" | "/tasks" | "/checklists" | "/expenses" | "/settings";
  icon: typeof LayoutGrid;
  group: "core" | "system";
  blurb: string;
};

export const modules: ModuleDef[] = [
  { label: "Home", to: "/", icon: LayoutGrid, group: "core", blurb: "Your day, composed" },
  { label: "Tasks", to: "/tasks", icon: ListChecks, group: "core", blurb: "Everything you owe yourself" },
  {
    label: "Checklists",
    to: "/checklists",
    icon: ClipboardCheck,
    group: "core",
    blurb: "Routines you repeat",
  },
  {
    label: "Expenses",
    to: "/expenses",
    icon: Wallet,
    group: "core",
    blurb: "Your financial command center",
  },
  { label: "Settings", to: "/settings", icon: Settings, group: "system", blurb: "Preferences" },
];

export const primaryNav = modules;

export function navIsActive(pathname: string, to: ModuleDef["to"]) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
