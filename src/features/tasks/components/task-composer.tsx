import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskComposer({
  onSubmit,
  pending,
  placeholder = "Add a task",
  expandTrigger,
}: {
  onSubmit: (title: string) => void;
  pending?: boolean;
  placeholder?: string;
  expandTrigger?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (expandTrigger) setExpanded(true);
  }, [expandTrigger]);

  const submit = () => {
    const title = value.trim();
    if (!title) return;
    onSubmit(title);
    setValue("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-[background-color,box-shadow] duration-150 hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <span className="grid size-5 place-items-center rounded-full border border-dashed border-[var(--task-accent)]/40 text-[var(--task-accent)] transition-colors group-hover:border-[var(--task-accent)] group-hover:bg-[var(--task-accent-soft)]">
          <Plus className="size-3.5" strokeWidth={2} />
        </span>
        <span className="text-[14px] text-[var(--task-text-secondary)] group-hover:text-[var(--task-text)]">
          {placeholder}…
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-3 rounded-lg border border-[var(--task-accent)]/25 bg-[var(--task-surface-elevated)] px-3 py-2.5 shadow-[var(--task-shadow-sm)]"
    >
      <span
        className="size-5 shrink-0 rounded-full border border-[var(--task-checkbox-border)]"
        aria-hidden
      />
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setExpanded(false);
            setValue("");
          }
        }}
        placeholder="What needs to be done?"
        aria-label="New task title"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-secondary)]"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        className={cn(
          "shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-opacity duration-150",
          "text-[var(--task-accent)] hover:bg-[var(--task-accent-soft)] disabled:opacity-40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
        )}
      >
        Add
      </button>
    </form>
  );
}
