/** Shared Tasks workspace utility classes (theme-token driven). */

export const taskEyebrow =
  "text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--task-accent)]";

export const taskPageTitle =
  "text-[1.875rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--task-text)] sm:text-[2rem]";

export const taskIconBtn =
  "grid size-8 place-items-center rounded-md border border-[var(--task-border)] bg-[var(--task-surface-secondary)] text-[var(--task-text-secondary)] transition-[color,background-color,border-color,box-shadow,transform] duration-150 hover:border-[var(--task-border-strong)] hover:bg-[var(--task-hover)] hover:text-[var(--task-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)] active:scale-[0.97]";

export const taskSegmented =
  "inline-flex items-center rounded-lg border border-[var(--task-border)] bg-[var(--task-surface-secondary)] p-0.5";

export const taskSegmentItem = (active: boolean) =>
  [
    "rounded-md px-3 py-1.5 text-xs font-medium transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
    active
      ? "bg-[var(--task-accent-soft)] text-[var(--task-accent)] shadow-[var(--task-shadow-sm)]"
      : "text-[var(--task-text-secondary)] hover:text-[var(--task-text)] hover:bg-[var(--task-hover)]",
  ].join(" ");
