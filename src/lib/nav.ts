import { ClipboardCheck, LayoutGrid, ListChecks, Settings } from "lucide-react";

/**
 * Primary navigation.
 *
 * Only modules with real backend capability appear here. Future
 * modules arrive when their API does — no placeholder entries.
 */
export type ModuleDef = {
  label: string;
  to: "/" | "/tasks" | "/checklists" | "/settings";
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
  { label: "Settings", to: "/settings", icon: Settings, group: "system", blurb: "Preferences" },
];

export const primaryNav = modules;
