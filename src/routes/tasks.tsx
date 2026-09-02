import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Can } from "@/features/capabilities/can";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { ExecutionHistoryPanel } from "@/features/tasks/components/execution-history-panel";
import { TaskComposer } from "@/features/tasks/components/task-composer";
import { TaskDateNavigator } from "@/features/tasks/components/task-controls";
import { TaskDetailPanel } from "@/features/tasks/components/task-detail-panel";
import { TaskListView } from "@/features/tasks/components/task-list-view";
import { TaskProgress } from "@/features/tasks/components/task-progress";
import { TasksHeader } from "@/features/tasks/components/tasks-header";
import { TasksWorkspace } from "@/features/tasks/components/tasks-workspace";
import { buildExecutionHistory } from "@/features/tasks/lib/execution-history";
import { filterBySearch, partitionTasks } from "@/features/tasks/lib/task-filters";
import { TaskThemeProvider } from "@/features/tasks/lib/task-theme-context";
import {
  defaultDueForDate,
  startOfDay,
  summarizeTasks,
  type TimelineFilter,
} from "@/features/tasks/lib/task-timeline";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { PERM } from "@/lib/permissions";
import type { TaskSummary } from "@/lib/api/types";

const tasksSearchSchema = z.object({
  taskId: z.string().optional(),
  filter: z.enum(["all", "today", "upcoming", "overdue"]).optional(),
});

export const Route = createFileRoute("/tasks")({
  beforeLoad: requirePermissions(PERM.TASKS_VIEW),
  validateSearch: (search) => tasksSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Tasks — Personal OS" }] }),
  component: TasksPageRoute,
});

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
  const { taskId: selectedTaskId = null, filter: searchFilter } = Route.useSearch();
  const filter: TimelineFilter = searchFilter ?? "all";

  const tasksQuery = useTasks({ perPage: 200 });
  const tasks = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data]);
  const mutations = useTaskMutations();
  const detailQuery = useTask(selectedTaskId);
  const composerRef = useRef<HTMLDivElement>(null);

  const [focusDate, setFocusDate] = useState(() => startOfDay());
  const [searchQuery, setSearchQuery] = useState("");
  const [composerBump, setComposerBump] = useState(0);

  const filteredTasks = useMemo(
    () => filterBySearch(tasks, searchQuery),
    [searchQuery, tasks],
  );

  const { active: activeTasks, completed: completedTasks } = useMemo(
    () => partitionTasks(filteredTasks),
    [filteredTasks],
  );

  const summary = useMemo(() => summarizeTasks(tasks), [tasks]);
  const executionGroups = useMemo(
    () => buildExecutionHistory(completedTasks),
    [completedTasks],
  );

  const progressTotal = activeTasks.length + completedTasks.length;
  const progressCompleted = completedTasks.length;

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
    setFilter("today");
  }, [setFilter]);

  const onFocusDateChange = useCallback((date: Date) => {
    setFocusDate(startOfDay(date));
  }, []);

  const canUpdate = can(PERM.TASKS_UPDATE);
  const canDelete = can(PERM.TASKS_DELETE);

  const rowHandlers = {
    onToggleFavorite: canUpdate ? handleToggleFavorite : undefined,
    onArchive: canUpdate ? handleArchive : undefined,
    onDelete: canDelete ? handleDelete : undefined,
    canUpdate,
    canDelete,
  };

  const mainContent = (
    <>
      <TaskProgress completed={progressCompleted} total={progressTotal} />

      <TaskDateNavigator
        focusDate={focusDate}
        onChange={onFocusDateChange}
        onJumpToday={jumpToToday}
        onJumpWeek={() => setFilter("upcoming")}
      />

      <div ref={composerRef} className="mb-6">
        <Can permission={PERM.TASKS_CREATE}>
          <TaskComposer
            expandTrigger={composerBump}
            onSubmit={handleQuickCreate}
            pending={mutations.create.isPending}
          />
        </Can>
      </div>

      {tasksQuery.isLoading ? (
        <RowsSkeleton rows={8} />
      ) : tasksQuery.isError ? (
        <ErrorState
          error={tasksQuery.error}
          title="Unable to load tasks."
          onRetry={() => tasksQuery.refetch()}
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
    </>
  );

  return (
    <>
      <TasksWorkspace
        header={
          <TasksHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            summary={summary}
          />
        }
        main={mainContent}
        timeline={<ExecutionHistoryPanel groups={executionGroups} onOpen={openTask} />}
      />

      {selectedTaskId ? (
        <Sheet open onOpenChange={(open) => !open && closeDetail()}>
          <SheetContent
            side="right"
            className="w-full border-[var(--task-border)] bg-[var(--task-surface)] p-0 sm:max-w-lg"
          >
            <TaskDetailPanel
              taskId={selectedTaskId}
              detailQuery={detailQuery}
              mutations={mutations}
              onClose={closeDetail}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
