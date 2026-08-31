import { ListTodo, Plus, Star } from "lucide-react";
import {
  deriveTaskLists,
  type TaskListNav,
} from "@/features/tasks/lib/task-filters";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function NavItem({
  active,
  onClick,
  children,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-[background-color,color,box-shadow] duration-150",
        active
          ? "bg-[var(--task-accent-soft)] font-medium text-[var(--task-text)] shadow-[var(--task-shadow-sm)]"
          : "text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]",
      )}
    >
      {active ? (
        <span
          className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--task-accent)]"
          aria-hidden
        />
      ) : null}
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && count > 0 ? (
        <span className="tabular-nums text-[11px] text-[var(--task-text-secondary)]">{count}</span>
      ) : null}
    </button>
  );
}

function SidebarDivider() {
  return <div className="my-3 h-px bg-[var(--task-border-subtle)]" role="separator" />;
}

export function TasksSidebar({
  tasks,
  customLists,
  listNav,
  onListNavChange,
  onCreateTask,
  onCreateList,
  className,
}: {
  tasks: TaskSummary[];
  customLists: string[];
  listNav: TaskListNav;
  onListNavChange: (nav: TaskListNav) => void;
  onCreateTask: () => void;
  onCreateList: () => void;
  className?: string;
}) {
  const lists = deriveTaskLists(tasks, customLists);
  const starredCount = tasks.filter((t) => t.favorite).length;

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--task-border-subtle)] bg-[var(--task-surface-secondary)]/80 px-3 py-5 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 px-2.5">
        <ListTodo className="size-4 text-[var(--task-accent)]" strokeWidth={1.75} />
        <span className="text-[13px] font-semibold tracking-wide text-[var(--task-text)]">Tasks</span>
      </div>

      <button
        type="button"
        onClick={onCreateTask}
        className="mb-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--task-accent)]/25 bg-[var(--task-accent-soft)] px-3 py-2 text-[13px] font-medium text-[var(--task-accent)] shadow-[var(--task-shadow-sm)] transition-[transform,box-shadow,background-color] duration-150 hover:border-[var(--task-accent)]/40 hover:bg-[var(--task-accent-soft)] hover:shadow-[var(--task-shadow-workspace)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <Plus className="size-4" strokeWidth={2} />
        Create
      </button>

      <SidebarDivider />

      <nav className="space-y-0.5" aria-label="Task views">
        <NavItem active={listNav === "all"} onClick={() => onListNavChange("all")}>
          All tasks
        </NavItem>
        <NavItem
          active={listNav === "starred"}
          onClick={() => onListNavChange("starred")}
          icon={<Star className="size-[15px] shrink-0" strokeWidth={1.75} />}
          count={starredCount}
        >
          Starred
        </NavItem>
      </nav>

      <div className="mt-5 mb-2 px-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--task-text-secondary)]">
          Lists
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto" aria-label="Task lists">
        <NavItem
          active={listNav === "list:My Tasks"}
          onClick={() => onListNavChange("list:My Tasks")}
        >
          My Tasks
        </NavItem>
        {lists
          .filter((name) => name !== "My Tasks")
          .map((name) => (
            <NavItem
              key={name}
              active={listNav === `list:${name}`}
              onClick={() => onListNavChange(`list:${name}`)}
            >
              {name}
            </NavItem>
          ))}
      </nav>

      <button
        type="button"
        onClick={onCreateList}
        className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <Plus className="size-4" strokeWidth={1.75} />
        Create new list
      </button>
    </aside>
  );
}
