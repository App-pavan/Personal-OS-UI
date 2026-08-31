import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

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
        className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left text-sm text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)]"
      >
        <Plus className="size-5 text-[var(--task-accent)]" />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 px-2 py-2"
    >
      <span
        className="mt-0.5 size-[18px] shrink-0 rounded-full border border-[var(--task-checkbox-border)]"
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
        onBlur={() => {
          if (!value.trim()) setExpanded(false);
        }}
        placeholder="What needs to be done?"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-secondary)]"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-[var(--task-accent)] disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
