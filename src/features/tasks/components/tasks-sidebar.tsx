import { ListTodo, Plus, Star } from "lucide-react";
import {
  deriveTaskLists,
  listNavLabel,
  type TaskListNav,
} from "@/features/tasks/lib/task-filters";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function NavItem({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-[var(--task-accent-soft)] font-medium text-[var(--task-accent)]"
          : "text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]",
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
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

  return (
    <aside
      className={cn(
        "flex h-full w-[220px] shrink-0 flex-col border-r border-[var(--task-border)] bg-[var(--task-surface-secondary)] px-3 py-4",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 px-2">
        <ListTodo className="size-4 text-[var(--task-accent)]" />
        <span className="text-sm font-semibold text-[var(--task-text)]">Tasks</span>
      </div>

      <button
        type="button"
        onClick={onCreateTask}
        className="mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--task-text)] transition-colors hover:bg-[var(--task-hover)]"
      >
        <Plus className="size-4" />
        Create
      </button>

      <nav className="space-y-0.5" aria-label="Task views">
        <NavItem active={listNav === "all"} onClick={() => onListNavChange("all")}>
          All tasks
        </NavItem>
        <NavItem
          active={listNav === "starred"}
          onClick={() => onListNavChange("starred")}
          icon={<Star className="size-4 shrink-0" />}
        >
          Starred
        </NavItem>
      </nav>

      <div className="mt-6 mb-2 px-3">
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
        className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
      >
        <Plus className="size-4" />
        Create new list
      </button>

      <p className="mt-3 px-3 text-[10px] leading-relaxed text-[var(--task-text-secondary)]">
        {listNavLabel(listNav)}
      </p>
    </aside>
  );
}
