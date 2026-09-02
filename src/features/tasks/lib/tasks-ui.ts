/** Shared layout classes for the Tasks page grid. */
export const tasksPageShell = "tasks-page mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10";

export const tasksWorkspaceGrid =
  "grid grid-cols-1 gap-y-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10 xl:gap-y-0";

export const taskEyebrow =
  "text-xs font-medium uppercase tracking-[0.14em] text-[var(--task-accent)]";

export const taskPageTitle =
  "text-[1.875rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--task-text)] sm:text-[2.125rem] lg:text-[2.25rem]";

export const taskSummaryText = "text-[15px] leading-relaxed text-[var(--task-text-secondary)]";

export const taskSectionTitle =
  "text-[13px] font-semibold tracking-wide text-[var(--task-section-header)]";

export const taskIconBtn =
  "grid size-9 place-items-center rounded-lg border border-[var(--task-border)] bg-[var(--task-surface-secondary)] text-[var(--task-text-secondary)] transition-[color,background-color,border-color,box-shadow,transform] duration-150 hover:border-[var(--task-border-strong)] hover:bg-[var(--task-hover)] hover:text-[var(--task-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)] active:scale-[0.97]";

export const taskSegmented =
  "inline-flex items-center gap-0.5 rounded-xl bg-[var(--task-surface-secondary)] p-1";

export const taskSegmentItem = (active: boolean) =>
  [
    "rounded-lg px-4 py-2 text-sm font-medium transition-[color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
    active
      ? "bg-[var(--task-accent-soft)] text-[var(--task-accent)]"
      : "text-[var(--task-text-secondary)] hover:text-[var(--task-text)] hover:bg-[var(--task-hover)]",
  ].join(" ");

export const taskRowGrid =
  "grid grid-cols-[32px_minmax(0,1fr)_32px] items-start gap-x-4";

/** Task detail panel — shared control styling */
export const taskPanelSectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]";

export const taskPanelInput =
  "h-10 rounded-lg border border-[var(--task-panel-border)] bg-[var(--task-panel-input-bg)] px-3 text-[15px] text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]";

export const taskPanelPopover =
  "z-[110] border-[var(--task-panel-border)] bg-[var(--task-panel-bg)] text-[var(--task-text)] shadow-lg";
