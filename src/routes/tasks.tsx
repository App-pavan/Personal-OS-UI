import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Can } from "@/features/capabilities/can";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { TaskComposer } from "@/features/tasks/components/task-composer";
import { TaskDateNavigator } from "@/features/tasks/components/task-controls";
import { TaskDetailPane } from "@/features/tasks/components/task-detail-pane";
import { TaskExecutionTimeline } from "@/features/tasks/components/task-execution-timeline";
import { TaskListView } from "@/features/tasks/components/task-list-view";
import { TasksHeader } from "@/features/tasks/components/tasks-header";
import { TasksSidebar } from "@/features/tasks/components/tasks-sidebar";
import {
  filterByListNav,
  filterBySearch,
  listNavLabel,
  loadCustomLists,
  partitionTasks,
  saveCustomLists,
  TASK_VIEW_MODE_KEY,
  type TaskListNav,
} from "@/features/tasks/lib/task-filters";
import { TaskThemeProvider } from "@/features/tasks/lib/task-theme-context";
import {
  buildDateTimeline,
  dateKey,
  defaultDueForDate,
  startOfDay,
  summarizeTasks,
  type TimelineFilter,
} from "@/features/tasks/lib/task-timeline";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PERM } from "@/lib/permissions";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const tasksSearchSchema = z.object({
  taskId: z.string().optional(),
  filter: z.enum(["all", "today", "upcoming", "overdue"]).optional(),
  list: z.string().optional(),
});

export const Route = createFileRoute("/tasks")({
  beforeLoad: requirePermissions(PERM.TASKS_VIEW),
  validateSearch: (search) => tasksSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Tasks — Personal OS" }] }),
  component: TasksPageRoute,
});

type ViewMode = "timeline" | "list";

function TasksPageRoute() {
  return (
    <TaskThemeProvider>
      <TasksPage />
    </TaskThemeProvider>
  );
}

function TasksPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useCapabilities();
  const { taskId: selectedTaskId = null, filter: searchFilter, list: searchList } = Route.useSearch();
  const filter: TimelineFilter = searchFilter ?? "all";
  const listNav: TaskListNav =
    searchList === "starred" ? "starred" : searchList ? `list:${searchList}` : "all";

  const tasksQuery = useTasks({ perPage: 200 });
  const tasks = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data]);
  const mutations = useTaskMutations();
  const detailQuery = useTask(selectedTaskId);
  const composerRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const stored = window.localStorage.getItem(TASK_VIEW_MODE_KEY);
    return stored === "timeline" ? "timeline" : "list";
  });
  const [focusDate, setFocusDate] = useState(() => startOfDay());
  const [focusDateKey, setFocusDateKey] = useState<string | undefined>("scroll-today");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customLists, setCustomLists] = useState<string[]>(() => loadCustomLists());
  const [composerBump, setComposerBump] = useState(0);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    window.localStorage.setItem(TASK_VIEW_MODE_KEY, mode);
  }, []);

  const setListNav = useCallback(
    (nav: TaskListNav) => {
      navigate({
        search: (prev) => ({
          ...prev,
          list:
            nav === "all" ? undefined : nav === "starred" ? "starred" : nav.slice(5),
        }),
        replace: true,
      });
      setSidebarOpen(false);
    },
    [navigate],
  );

  const filteredTasks = useMemo(() => {
    if (listNav === "list:My Tasks") {
      return filterBySearch(
        tasks.filter((t) => !t.projectName && !(t.labels?.length)),
        searchQuery,
      );
    }
    return filterBySearch(filterByListNav(tasks, listNav), searchQuery);
  }, [listNav, searchQuery, tasks]);

  const { active: activeTasks, completed: completedTasks } = useMemo(
    () => partitionTasks(filteredTasks),
    [filteredTasks],
  );

  const summary = useMemo(() => summarizeTasks(tasks), [tasks]);
  const sections = useMemo(() => buildDateTimeline(activeTasks, filter), [activeTasks, filter]);

  const setFilter = useCallback(
    (next: TimelineFilter) => {
      navigate({
        search: (prev) => ({ ...prev, filter: next === "all" ? undefined : next }),
        replace: true,
      });
    },
    [navigate],
  );

  const openTask = useCallback(
    (id: string) => {
      navigate({ search: (prev) => ({ ...prev, taskId: id }), replace: true });
    },
    [navigate],
  );

  const closeDetail = useCallback(() => {
    navigate({
      search: (prev) => {
        const { taskId: _, ...rest } = prev;
        return rest;
      },
      replace: true,
    });
  }, [navigate]);

  const handleToggleComplete = useCallback(
    (task: TaskSummary) => {
      const done = task.status === "completed" || Boolean(task.completedAt);
      if (done) mutations.reopen.mutate([task.id]);
      else mutations.complete.mutate([task.id]);
    },
    [mutations],
  );

  const handleQuickCreate = useCallback(
    (title: string) => {
      mutations.create.mutate({
        title,
        dueAt: defaultDueForDate(focusDate),
      });
    },
    [focusDate, mutations.create],
  );

  const handleToggleFavorite = useCallback(
    (task: TaskSummary) => {
      mutations.favorite.mutate([task.id, !task.favorite]);
    },
    [mutations.favorite],
  );

  const handleArchive = useCallback(
    (task: TaskSummary) => {
      mutations.archive.mutate([task.id]);
    },
    [mutations.archive],
  );

  const handleDelete = useCallback(
    (task: TaskSummary) => {
      mutations.remove.mutate([task.id]);
      if (selectedTaskId === task.id) closeDetail();
    },
    [closeDetail, mutations.remove, selectedTaskId],
  );

  const jumpToToday = useCallback(() => {
    setFocusDate(startOfDay());
    setFocusDateKey("scroll-today");
    setFilter("today");
  }, [setFilter]);

  const onFocusDateChange = useCallback((date: Date) => {
    setFocusDate(startOfDay(date));
    setFocusDateKey(dateKey(startOfDay(date)));
  }, []);

  const focusComposer = useCallback(() => {
    setComposerBump((n) => n + 1);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleCreateList = useCallback(() => {
    const name = window.prompt("List name");
    if (!name?.trim()) return;
    const trimmed = name.trim();
    const next = [...new Set([...customLists, trimmed])];
    setCustomLists(next);
    saveCustomLists(next);
    setListNav(`list:${trimmed}`);
    toast.success(`List "${trimmed}" created — assign via task labels or project.`);
  }, [customLists, setListNav]);

  const canUpdate = can(PERM.TASKS_UPDATE);
  const canDelete = can(PERM.TASKS_DELETE);
  const isLgUp = useMediaQuery("(min-width: 1024px)");

  const summaryLine = `${summary.today} today · ${summary.overdue} overdue · ${summary.upcoming} upcoming`;

  const rowHandlers = {
    onToggleFavorite: canUpdate ? handleToggleFavorite : undefined,
    onArchive: canUpdate ? handleArchive : undefined,
    onDelete: canDelete ? handleDelete : undefined,
    canUpdate,
    canDelete,
  };

  const detailBody =
    detailQuery.isLoading ? (
      <RowsSkeleton rows={8} />
    ) : detailQuery.isError || !detailQuery.data ? (
      <ErrorState
        error={detailQuery.error}
        title="Task could not be loaded."
        onRetry={() => detailQuery.refetch()}
      />
    ) : (
      <TaskDetailPane task={detailQuery.data} onClose={closeDetail} mutations={mutations} />
    );

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] bg-[var(--task-bg)] text-[var(--task-text)]">
      <TasksSidebar
        tasks={tasks}
        customLists={customLists}
        listNav={listNav}
        onListNavChange={setListNav}
        onCreateTask={focusComposer}
        onCreateList={handleCreateList}
        className={cn(
          "hidden lg:flex",
          sidebarOpen && "!flex fixed inset-y-0 left-0 z-40 lg:relative lg:z-auto",
        )}
      />

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-[var(--task-border)] px-4 py-2 lg:hidden">
            <button
              type="button"
              aria-label="Open task navigation"
              onClick={() => setSidebarOpen(true)}
              className="grid size-9 place-items-center rounded-md hover:bg-[var(--task-hover)]"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-medium">{listNavLabel(listNav)}</span>
          </div>

          <TasksHeader
            title={listNavLabel(listNav)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            summaryLine={summaryLine}
          />

          <div className="flex flex-wrap gap-1 border-b border-[var(--task-border)] px-4 py-2 sm:px-6">
            {(
              [
                ["all", "All"],
                ["today", "Today"],
                ["upcoming", "Upcoming"],
                ["overdue", "Overdue"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors",
                  filter === key
                    ? "bg-[var(--task-accent-soft)] text-[var(--task-accent)]"
                    : "text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div
              ref={composerRef}
              className="border-b border-[var(--task-border)] bg-[var(--task-surface)]"
            >
              <Can permission={PERM.TASKS_CREATE}>
                <TaskComposer
                  expandTrigger={composerBump}
                  onSubmit={handleQuickCreate}
                  pending={mutations.create.isPending}
                />
              </Can>
            </div>

            {viewMode === "timeline" ? (
              <div className="border-b border-[var(--task-border)] px-4 py-3 sm:px-6">
                <TaskDateNavigator
                  focusDate={focusDate}
                  onChange={onFocusDateChange}
                  onJumpToday={jumpToToday}
                  onJumpWeek={() => {
                    setFocusDate(startOfDay());
                    setFocusDateKey("scroll-today");
                    setFilter("upcoming");
                  }}
                />
              </div>
            ) : null}

            <div className="px-1 sm:px-3">
              {tasksQuery.isLoading ? (
                <div className="mt-4">
                  <RowsSkeleton rows={8} />
                </div>
              ) : tasksQuery.isError ? (
                <ErrorState
                  error={tasksQuery.error}
                  title="Unable to load tasks."
                  onRetry={() => tasksQuery.refetch()}
                />
              ) : viewMode === "timeline" ? (
                <TaskExecutionTimeline
                  sections={sections}
                  completedTasks={completedTasks}
                  focusDateKey={focusDateKey}
                  selectedId={selectedTaskId}
                  onOpen={openTask}
                  onToggleComplete={handleToggleComplete}
                  {...rowHandlers}
                />
              ) : (
                <TaskListView
                  tasks={activeTasks}
                  completedTasks={completedTasks}
                  filter={filter}
                  selectedId={selectedTaskId}
                  onOpen={openTask}
                  onToggleComplete={handleToggleComplete}
                  {...rowHandlers}
                />
              )}
            </div>
          </div>
        </main>

        {selectedTaskId ? (
          <aside className="hidden w-[380px] shrink-0 border-l border-[var(--task-border)] bg-[var(--task-surface)] lg:block">
            <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto p-4 sm:p-5">{detailBody}</div>
          </aside>
        ) : null}
      </div>

      {!isLgUp && selectedTaskId ? (
        <Sheet open onOpenChange={(open) => !open && closeDetail()}>
          <SheetContent
            side="right"
            className="w-full border-[var(--task-border)] bg-[var(--task-surface)] p-0 sm:max-w-md"
          >
            <div className="max-h-full overflow-y-auto p-4">{detailBody}</div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
