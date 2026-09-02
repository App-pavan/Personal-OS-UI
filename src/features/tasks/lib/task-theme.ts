import type { TaskPriority } from "@/lib/api/types";

export type TaskThemeId =
  | "personal-os-dark"
  | "personal-os-light"
  | "midnight"
  | "deep-ocean"
  | "graphite"
  | "soft-lavender"
  | "forest"
  | "warm-sand"
  | "rose"
  | "arctic-blue";

export type TaskThemeTokens = {
  id: TaskThemeId;
  name: string;
  preview: [string, string, string];
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceSelected: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  accent: string;
  accentSoft: string;
  border: string;
  borderStrong: string;
  completedText: string;
  overdueText: string;
  hoverSurface: string;
  checkboxBorder: string;
  sectionHeader: string;
  priority: Record<TaskPriority, string>;
};

export const TASK_THEME_STORAGE_KEY = "personal-os-tasks-theme";

/** Maps legacy theme ids from earlier Tasks releases. */
export const LEGACY_TASK_THEME_IDS: Record<string, TaskThemeId> = {
  "personal-os": "personal-os-dark",
  "light-minimal": "personal-os-light",
  ocean: "deep-ocean",
  lavender: "soft-lavender",
  warm: "warm-sand",
  midnight: "midnight",
  forest: "forest",
};

function theme(
  partial: Omit<TaskThemeTokens, "preview"> & { preview: [string, string, string] },
): TaskThemeTokens {
  return partial;
}

export const TASK_THEMES: Record<TaskThemeId, TaskThemeTokens> = {
  "personal-os-dark": theme({
    id: "personal-os-dark",
    name: "Personal OS Dark",
    preview: ["#0a0f18", "#111827", "#2dd4bf"],
    background: "#0a0f18",
    surface: "rgba(17, 24, 39, 0.72)",
    surfaceSecondary: "rgba(17, 24, 39, 0.45)",
    surfaceSelected: "rgba(45, 212, 191, 0.1)",
    primaryText: "#f1f5f9",
    secondaryText: "#94a3b8",
    mutedText: "#64748b",
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.12)",
    border: "rgba(148, 163, 184, 0.14)",
    borderStrong: "rgba(148, 163, 184, 0.22)",
    completedText: "#64748b",
    overdueText: "#f87171",
    hoverSurface: "rgba(45, 212, 191, 0.06)",
    checkboxBorder: "rgba(148, 163, 184, 0.32)",
    sectionHeader: "#94a3b8",
    priority: { urgent: "#f87171", high: "#fbbf24", normal: "#2dd4bf", low: "#64748b" },
  }),
  "personal-os-light": theme({
    id: "personal-os-light",
    name: "Personal OS Light",
    preview: ["#f4f6f9", "#ffffff", "#0d9488"],
    background: "#f4f6f9",
    surface: "#ffffff",
    surfaceSecondary: "#eef1f6",
    surfaceSelected: "rgba(13, 148, 136, 0.08)",
    primaryText: "#0f172a",
    secondaryText: "#64748b",
    mutedText: "#94a3b8",
    accent: "#0d9488",
    accentSoft: "rgba(13, 148, 136, 0.1)",
    border: "rgba(15, 23, 42, 0.08)",
    borderStrong: "rgba(15, 23, 42, 0.14)",
    completedText: "#94a3b8",
    overdueText: "#dc2626",
    hoverSurface: "rgba(13, 148, 136, 0.05)",
    checkboxBorder: "rgba(15, 23, 42, 0.18)",
    sectionHeader: "#64748b",
    priority: { urgent: "#dc2626", high: "#d97706", normal: "#0d9488", low: "#94a3b8" },
  }),
  midnight: theme({
    id: "midnight",
    name: "Midnight",
    preview: ["#050508", "#12121a", "#818cf8"],
    background: "#050508",
    surface: "rgba(18, 18, 26, 0.9)",
    surfaceSecondary: "rgba(18, 18, 26, 0.55)",
    surfaceSelected: "rgba(129, 140, 248, 0.12)",
    primaryText: "#f4f4f5",
    secondaryText: "#a1a1aa",
    mutedText: "#71717a",
    accent: "#818cf8",
    accentSoft: "rgba(129, 140, 248, 0.14)",
    border: "rgba(161, 161, 170, 0.12)",
    borderStrong: "rgba(161, 161, 170, 0.2)",
    completedText: "#71717a",
    overdueText: "#fca5a5",
    hoverSurface: "rgba(129, 140, 248, 0.07)",
    checkboxBorder: "rgba(161, 161, 170, 0.28)",
    sectionHeader: "#a1a1aa",
    priority: { urgent: "#fca5a5", high: "#fcd34d", normal: "#818cf8", low: "#71717a" },
  }),
  "deep-ocean": theme({
    id: "deep-ocean",
    name: "Deep Ocean",
    preview: ["#041018", "#0c1929", "#22d3ee"],
    background: "#041018",
    surface: "rgba(12, 25, 41, 0.88)",
    surfaceSecondary: "rgba(12, 25, 41, 0.52)",
    surfaceSelected: "rgba(34, 211, 238, 0.1)",
    primaryText: "#e0f2fe",
    secondaryText: "#7dd3fc",
    mutedText: "#64748b",
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.12)",
    border: "rgba(125, 211, 252, 0.14)",
    borderStrong: "rgba(125, 211, 252, 0.22)",
    completedText: "#64748b",
    overdueText: "#fb7185",
    hoverSurface: "rgba(34, 211, 238, 0.07)",
    checkboxBorder: "rgba(125, 211, 252, 0.26)",
    sectionHeader: "#7dd3fc",
    priority: { urgent: "#fb7185", high: "#fbbf24", normal: "#22d3ee", low: "#64748b" },
  }),
  graphite: theme({
    id: "graphite",
    name: "Graphite",
    preview: ["#111113", "#1c1c1f", "#60a5fa"],
    background: "#111113",
    surface: "rgba(28, 28, 31, 0.92)",
    surfaceSecondary: "rgba(28, 28, 31, 0.58)",
    surfaceSelected: "rgba(96, 165, 250, 0.1)",
    primaryText: "#fafafa",
    secondaryText: "#a1a1aa",
    mutedText: "#71717a",
    accent: "#60a5fa",
    accentSoft: "rgba(96, 165, 250, 0.12)",
    border: "rgba(161, 161, 170, 0.12)",
    borderStrong: "rgba(161, 161, 170, 0.2)",
    completedText: "#71717a",
    overdueText: "#f87171",
    hoverSurface: "rgba(96, 165, 250, 0.06)",
    checkboxBorder: "rgba(161, 161, 170, 0.28)",
    sectionHeader: "#a1a1aa",
    priority: { urgent: "#f87171", high: "#fbbf24", normal: "#60a5fa", low: "#71717a" },
  }),
  "soft-lavender": theme({
    id: "soft-lavender",
    name: "Soft Lavender",
    preview: ["#13101c", "#1e1830", "#a78bfa"],
    background: "#13101c",
    surface: "rgba(30, 24, 48, 0.88)",
    surfaceSecondary: "rgba(30, 24, 48, 0.52)",
    surfaceSelected: "rgba(167, 139, 250, 0.12)",
    primaryText: "#f5f3ff",
    secondaryText: "#c4b5fd",
    mutedText: "#78716c",
    accent: "#a78bfa",
    accentSoft: "rgba(167, 139, 250, 0.14)",
    border: "rgba(196, 181, 253, 0.14)",
    borderStrong: "rgba(196, 181, 253, 0.22)",
    completedText: "#78716c",
    overdueText: "#fda4af",
    hoverSurface: "rgba(167, 139, 250, 0.08)",
    checkboxBorder: "rgba(196, 181, 253, 0.26)",
    sectionHeader: "#c4b5fd",
    priority: { urgent: "#fda4af", high: "#fcd34d", normal: "#a78bfa", low: "#78716c" },
  }),
  forest: theme({
    id: "forest",
    name: "Forest",
    preview: ["#071008", "#142018", "#4ade80"],
    background: "#071008",
    surface: "rgba(20, 32, 24, 0.9)",
    surfaceSecondary: "rgba(20, 32, 24, 0.55)",
    surfaceSelected: "rgba(74, 222, 128, 0.1)",
    primaryText: "#ecfdf5",
    secondaryText: "#86efac",
    mutedText: "#6b7280",
    accent: "#4ade80",
    accentSoft: "rgba(74, 222, 128, 0.12)",
    border: "rgba(134, 239, 172, 0.14)",
    borderStrong: "rgba(134, 239, 172, 0.22)",
    completedText: "#6b7280",
    overdueText: "#fca5a5",
    hoverSurface: "rgba(74, 222, 128, 0.07)",
    checkboxBorder: "rgba(134, 239, 172, 0.26)",
    sectionHeader: "#86efac",
    priority: { urgent: "#fca5a5", high: "#fbbf24", normal: "#4ade80", low: "#6b7280" },
  }),
  "warm-sand": theme({
    id: "warm-sand",
    name: "Warm Sand",
    preview: ["#f5efe6", "#ebe3d6", "#b45309"],
    background: "#f5efe6",
    surface: "#faf6f0",
    surfaceSecondary: "#ebe3d6",
    surfaceSelected: "rgba(180, 83, 9, 0.08)",
    primaryText: "#292524",
    secondaryText: "#78716c",
    mutedText: "#a8a29e",
    accent: "#b45309",
    accentSoft: "rgba(180, 83, 9, 0.1)",
    border: "rgba(41, 37, 36, 0.08)",
    borderStrong: "rgba(41, 37, 36, 0.14)",
    completedText: "#a8a29e",
    overdueText: "#dc2626",
    hoverSurface: "rgba(180, 83, 9, 0.05)",
    checkboxBorder: "rgba(41, 37, 36, 0.16)",
    sectionHeader: "#78716c",
    priority: { urgent: "#dc2626", high: "#d97706", normal: "#b45309", low: "#a8a29e" },
  }),
  rose: theme({
    id: "rose",
    name: "Rose",
    preview: ["#1a0f14", "#2a1620", "#fb7185"],
    background: "#1a0f14",
    surface: "rgba(42, 22, 32, 0.9)",
    surfaceSecondary: "rgba(42, 22, 32, 0.55)",
    surfaceSelected: "rgba(251, 113, 133, 0.1)",
    primaryText: "#fff1f2",
    secondaryText: "#fda4af",
    mutedText: "#78716c",
    accent: "#fb7185",
    accentSoft: "rgba(251, 113, 133, 0.12)",
    border: "rgba(253, 164, 175, 0.14)",
    borderStrong: "rgba(253, 164, 175, 0.22)",
    completedText: "#78716c",
    overdueText: "#fecdd3",
    hoverSurface: "rgba(251, 113, 133, 0.07)",
    checkboxBorder: "rgba(253, 164, 175, 0.26)",
    sectionHeader: "#fda4af",
    priority: { urgent: "#fecdd3", high: "#fcd34d", normal: "#fb7185", low: "#78716c" },
  }),
  "arctic-blue": theme({
    id: "arctic-blue",
    name: "Arctic Blue",
    preview: ["#f0f7ff", "#e8f2fc", "#2563eb"],
    background: "#f0f7ff",
    surface: "#ffffff",
    surfaceSecondary: "#e8f2fc",
    surfaceSelected: "rgba(37, 99, 235, 0.08)",
    primaryText: "#0f172a",
    secondaryText: "#475569",
    mutedText: "#94a3b8",
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.1)",
    border: "rgba(15, 23, 42, 0.08)",
    borderStrong: "rgba(15, 23, 42, 0.14)",
    completedText: "#94a3b8",
    overdueText: "#dc2626",
    hoverSurface: "rgba(37, 99, 235, 0.05)",
    checkboxBorder: "rgba(15, 23, 42, 0.16)",
    sectionHeader: "#475569",
    priority: { urgent: "#dc2626", high: "#d97706", normal: "#2563eb", low: "#94a3b8" },
  }),
};

export const TASK_THEME_IDS = Object.keys(TASK_THEMES) as TaskThemeId[];

export function resolveTaskThemeId(stored: string | null): TaskThemeId {
  if (stored && stored in TASK_THEMES) return stored as TaskThemeId;
  if (stored && stored in LEGACY_TASK_THEME_IDS) return LEGACY_TASK_THEME_IDS[stored]!;
  return "personal-os-dark";
}

export function themeToCssVars(themeTokens: TaskThemeTokens): Record<string, string> {
  return {
    "--task-bg": themeTokens.background,
    "--task-surface": themeTokens.surface,
    "--task-surface-secondary": themeTokens.surfaceSecondary,
    "--task-surface-elevated": themeTokens.surface,
    "--task-surface-selected": themeTokens.surfaceSelected,
    "--task-text": themeTokens.primaryText,
    "--task-text-secondary": themeTokens.secondaryText,
    "--task-text-muted": themeTokens.mutedText,
    "--task-accent": themeTokens.accent,
    "--task-accent-soft": themeTokens.accentSoft,
    "--task-border": themeTokens.border,
    "--task-border-subtle": themeTokens.border,
    "--task-border-strong": themeTokens.borderStrong,
    "--task-completed": themeTokens.completedText,
    "--task-overdue": themeTokens.overdueText,
    "--task-hover": themeTokens.hoverSurface,
    "--task-surface-hover": themeTokens.hoverSurface,
    "--task-checkbox-border": themeTokens.checkboxBorder,
    "--task-section-header": themeTokens.sectionHeader,
    "--task-focus-ring": `${themeTokens.accent}55`,
    "--task-shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.12)",
    "--task-priority-urgent": themeTokens.priority.urgent,
    "--task-priority-high": themeTokens.priority.high,
    "--task-priority-normal": themeTokens.priority.normal,
    "--task-priority-low": themeTokens.priority.low,
  };
}
