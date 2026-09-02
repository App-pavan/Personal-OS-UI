import { useEffect, useState } from "react";
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
        className="group flex w-full items-center gap-3 rounded-xl px-2 py-3.5 text-left transition-colors duration-150 hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <span className="grid size-7 place-items-center rounded-full text-[var(--task-accent)]">
          <Plus className="size-5" strokeWidth={1.75} />
        </span>
        <span className="text-base text-[var(--task-text-secondary)] group-hover:text-[var(--task-text)]">
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
      className="flex items-center gap-3 rounded-xl bg-[var(--task-surface-elevated)] px-3 py-3"
    >
      <span className="size-7 shrink-0 rounded-full border-2 border-[var(--task-checkbox-border)]" aria-hidden />
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
        className="min-w-0 flex-1 bg-transparent text-base text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)]"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        className={cn(
          "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-opacity duration-150",
          "text-[var(--task-accent)] hover:bg-[var(--task-accent-soft)] disabled:opacity-40",
        )}
      >
        Add
      </button>
    </form>
  );
}
