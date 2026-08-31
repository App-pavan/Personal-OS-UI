import type { TaskPriority } from "@/lib/api/types";

export type TaskThemeId =
  | "personal-os"
  | "midnight"
  | "ocean"
  | "lavender"
  | "forest"
  | "warm"
  | "light-minimal";

export type TaskThemeTokens = {
  id: TaskThemeId;
  name: string;
  preview: [string, string, string, string, string];
  background: string;
  surface: string;
  surfaceSecondary: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
  accentSoft: string;
  border: string;
  completedText: string;
  overdueText: string;
  hoverSurface: string;
  checkboxBorder: string;
  sectionHeader: string;
  priority: Record<TaskPriority, string>;
};

export const TASK_THEME_STORAGE_KEY = "personal-os-tasks-theme";

export const TASK_THEMES: Record<TaskThemeId, TaskThemeTokens> = {
  "personal-os": {
    id: "personal-os",
    name: "Personal OS",
    preview: ["#0b1220", "#111827", "#1e293b", "#14b8a6", "#22d3ee"],
    background: "#0a0f18",
    surface: "rgba(15, 23, 42, 0.72)",
    surfaceSecondary: "rgba(15, 23, 42, 0.45)",
    primaryText: "#f1f5f9",
    secondaryText: "#94a3b8",
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.12)",
    border: "rgba(148, 163, 184, 0.18)",
    completedText: "#64748b",
    overdueText: "#f87171",
    hoverSurface: "rgba(45, 212, 191, 0.06)",
    checkboxBorder: "rgba(148, 163, 184, 0.35)",
    sectionHeader: "#94a3b8",
    priority: {
      urgent: "#f87171",
      high: "#fbbf24",
      normal: "#2dd4bf",
      low: "#64748b",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    preview: ["#050505", "#0a0a0a", "#171717", "#3b82f6", "#737373"],
    background: "#050505",
    surface: "rgba(23, 23, 23, 0.85)",
    surfaceSecondary: "rgba(23, 23, 23, 0.55)",
    primaryText: "#fafafa",
    secondaryText: "#a3a3a3",
    accent: "#60a5fa",
    accentSoft: "rgba(96, 165, 250, 0.12)",
    border: "rgba(163, 163, 163, 0.15)",
    completedText: "#737373",
    overdueText: "#fca5a5",
    hoverSurface: "rgba(96, 165, 250, 0.06)",
    checkboxBorder: "rgba(163, 163, 163, 0.3)",
    sectionHeader: "#a3a3a3",
    priority: {
      urgent: "#fca5a5",
      high: "#fcd34d",
      normal: "#60a5fa",
      low: "#737373",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    preview: ["#041018", "#0c1929", "#132f4c", "#06b6d4", "#38bdf8"],
    background: "#041018",
    surface: "rgba(12, 25, 41, 0.82)",
    surfaceSecondary: "rgba(12, 25, 41, 0.5)",
    primaryText: "#e0f2fe",
    secondaryText: "#7dd3fc",
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.12)",
    border: "rgba(125, 211, 252, 0.16)",
    completedText: "#64748b",
    overdueText: "#fb7185",
    hoverSurface: "rgba(34, 211, 238, 0.07)",
    checkboxBorder: "rgba(125, 211, 252, 0.28)",
    sectionHeader: "#7dd3fc",
    priority: {
      urgent: "#fb7185",
      high: "#fbbf24",
      normal: "#22d3ee",
      low: "#64748b",
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    preview: ["#0f0a18", "#1a1225", "#2a1f3d", "#a78bfa", "#c4b5fd"],
    background: "#0f0a18",
    surface: "rgba(26, 18, 37, 0.85)",
    surfaceSecondary: "rgba(26, 18, 37, 0.52)",
    primaryText: "#f5f3ff",
    secondaryText: "#c4b5fd",
    accent: "#a78bfa",
    accentSoft: "rgba(167, 139, 250, 0.14)",
    border: "rgba(196, 181, 253, 0.16)",
    completedText: "#78716c",
    overdueText: "#fda4af",
    hoverSurface: "rgba(167, 139, 250, 0.08)",
    checkboxBorder: "rgba(196, 181, 253, 0.28)",
    sectionHeader: "#c4b5fd",
    priority: {
      urgent: "#fda4af",
      high: "#fcd34d",
      normal: "#a78bfa",
      low: "#78716c",
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    preview: ["#071008", "#0f1a12", "#1a2e1f", "#4ade80", "#86efac"],
    background: "#071008",
    surface: "rgba(15, 26, 18, 0.85)",
    surfaceSecondary: "rgba(15, 26, 18, 0.52)",
    primaryText: "#ecfdf5",
    secondaryText: "#86efac",
    accent: "#4ade80",
    accentSoft: "rgba(74, 222, 128, 0.12)",
    border: "rgba(134, 239, 172, 0.16)",
    completedText: "#6b7280",
    overdueText: "#fca5a5",
    hoverSurface: "rgba(74, 222, 128, 0.07)",
    checkboxBorder: "rgba(134, 239, 172, 0.28)",
    sectionHeader: "#86efac",
    priority: {
      urgent: "#fca5a5",
      high: "#fbbf24",
      normal: "#4ade80",
      low: "#6b7280",
    },
  },
  warm: {
    id: "warm",
    name: "Warm",
    preview: ["#120c08", "#1c1410", "#2a2018", "#f59e0b", "#fbbf24"],
    background: "#120c08",
    surface: "rgba(28, 20, 16, 0.85)",
    surfaceSecondary: "rgba(28, 20, 16, 0.52)",
    primaryText: "#fef3c7",
    secondaryText: "#d6d3d1",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.14)",
    border: "rgba(214, 211, 209, 0.16)",
    completedText: "#78716c",
    overdueText: "#f87171",
    hoverSurface: "rgba(245, 158, 11, 0.08)",
    checkboxBorder: "rgba(214, 211, 209, 0.28)",
    sectionHeader: "#d6d3d1",
    priority: {
      urgent: "#f87171",
      high: "#fbbf24",
      normal: "#f59e0b",
      low: "#78716c",
    },
  },
  "light-minimal": {
    id: "light-minimal",
    name: "Light Minimal",
    preview: ["#f8fafc", "#ffffff", "#f1f5f9", "#0ea5e9", "#64748b"],
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceSecondary: "#f1f5f9",
    primaryText: "#0f172a",
    secondaryText: "#64748b",
    accent: "#0ea5e9",
    accentSoft: "rgba(14, 165, 233, 0.1)",
    border: "rgba(15, 23, 42, 0.1)",
    completedText: "#94a3b8",
    overdueText: "#dc2626",
    hoverSurface: "rgba(14, 165, 233, 0.06)",
    checkboxBorder: "rgba(15, 23, 42, 0.2)",
    sectionHeader: "#64748b",
    priority: {
      urgent: "#dc2626",
      high: "#d97706",
      normal: "#0ea5e9",
      low: "#94a3b8",
    },
  },
};

export const TASK_THEME_IDS = Object.keys(TASK_THEMES) as TaskThemeId[];

export function themeToCssVars(theme: TaskThemeTokens): Record<string, string> {
  return {
    "--task-bg": theme.background,
    "--task-surface": theme.surface,
    "--task-surface-secondary": theme.surfaceSecondary,
    "--task-surface-elevated": theme.surface,
    "--task-text": theme.primaryText,
    "--task-text-secondary": theme.secondaryText,
    "--task-accent": theme.accent,
    "--task-accent-soft": theme.accentSoft,
    "--task-border": theme.border,
    "--task-border-subtle": theme.border.replace("0.18", "0.1").replace("0.16", "0.08").replace("0.15", "0.08").replace("0.1", "0.06"),
    "--task-completed": theme.completedText,
    "--task-overdue": theme.overdueText,
    "--task-hover": theme.hoverSurface,
    "--task-checkbox-border": theme.checkboxBorder,
    "--task-section-header": theme.sectionHeader,
    "--task-focus-ring": `${theme.accent}55`,
    "--task-shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)",
    "--task-shadow-workspace": "0 4px 24px rgba(0, 0, 0, 0.12)",
    "--task-priority-urgent": theme.priority.urgent,
    "--task-priority-high": theme.priority.high,
    "--task-priority-normal": theme.priority.normal,
    "--task-priority-low": theme.priority.low,
  };
}
