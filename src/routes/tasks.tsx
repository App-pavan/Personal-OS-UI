import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Can } from "@/features/capabilities/can";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { ExecutionHistoryPanel } from "@/features/tasks/components/execution-history-panel";
import { TaskComposer } from "@/features/tasks/components/task-composer";
import { TaskEditorSheet } from "@/features/tasks/components/task-editor-sheet";
import { TaskDetailPanel } from "@/features/tasks/components/task-detail-panel";
import { TaskListView } from "@/features/tasks/components/task-list-view";
import { TaskProgress } from "@/features/tasks/components/task-progress";
import { TasksHeader } from "@/features/tasks/components/tasks-header";
import { TasksWorkspace } from "@/features/tasks/components/tasks-workspace";
import { buildExecutionHistory } from "@/features/tasks/lib/execution-history";
import {
  filterBySearch,
  filterTimelineTasks,
  filterWorkspaceTasks,
  isTaskCompleted,
  isTaskNotCompleted,
  partitionTasks,
} from "@/features/tasks/lib/task-filters";
import { TaskThemeProvider } from "@/features/tasks/lib/task-theme-context";
import { defaultDueForDate, startOfDay, type TaskWorkspaceFilter } from "@/features/tasks/lib/task-timeline";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useSyncTaskTagsFromList } from "@/hooks/use-task-tags";
import { PERM } from "@/lib/permissions";
import type { TaskSummary } from "@/lib/api/types";

const tasksSearchSchema = z.object({
  taskId: z.string().optional(),
  filter: z.enum(["all", "active", "completed", "archived"]).optional(),
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
  const filter: TaskWorkspaceFilter = searchFilter ?? "all";

  const tasksQuery = useTasks({ perPage: 200 });
  const tasks = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data]);
  useSyncTaskTagsFromList(tasks);
  const mutations = useTaskMutations();
  const detailQuery = useTask(selectedTaskId);
  const composerRef = useRef<HTMLDivElement>(null);

  const [focusDate] = useState(() => startOfDay());
  const [searchQuery, setSearchQuery] = useState("");
  const [composerBump, setComposerBump] = useState(0);

  const searchedTasks = useMemo(
    () => filterBySearch(tasks, searchQuery),
    [searchQuery, tasks],
  );

  const workspaceTasks = useMemo(
    () => filterWorkspaceTasks(searchedTasks, filter),
    [filter, searchedTasks],
  );

  const timelineTasks = useMemo(() => filterTimelineTasks(tasks), [tasks]);

  const executionGroups = useMemo(
    () => buildExecutionHistory(timelineTasks),
    [timelineTasks],
  );

  const { active: activeIncomplete, completed: activeCompleted } = useMemo(
    () => partitionTasks(tasks),
    [tasks],
  );
  const progressTotal = activeIncomplete.length + activeCompleted.length;
  const progressCompleted = activeCompleted.length;

  const setFilter = useCallback(
    (next: TaskWorkspaceFilter) => {
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
      if (isTaskCompleted(task)) mutations.reopen.mutate([task.id]);
      else mutations.complete.mutate([task.id]);
    },
    [mutations],
  );

  const handleMarkNotCompleted = useCallback(
    (task: TaskSummary) => {
      if (isTaskNotCompleted(task)) return;
      mutations.markNotCompleted.mutate([task.id], {
        onSuccess: () => {
          toast.success("Task marked not completed");
          if (selectedTaskId === task.id) closeDetail();
        },
      });
    },
    [closeDetail, mutations.markNotCompleted, selectedTaskId],
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
      mutations.archive.mutate([task.id], {
        onSuccess: () => {
          toast.success("Task archived", {
            action: {
              label: "Undo",
              onClick: () => mutations.restore.mutate([task.id]),
            },
          });
        },
      });
    },
    [mutations.archive, mutations.restore],
  );

  const handleUnarchive = useCallback(
    (task: TaskSummary) => {
      mutations.restore.mutate([task.id]);
    },
    [mutations.restore],
  );

  const canUpdate = can(PERM.TASKS_UPDATE);

  const rowHandlers = {
    onToggleFavorite: canUpdate ? handleToggleFavorite : undefined,
    onMarkNotCompleted: canUpdate ? handleMarkNotCompleted : undefined,
    onArchive: canUpdate ? handleArchive : undefined,
    onUnarchive: canUpdate ? handleUnarchive : undefined,
    canUpdate,
  };

  const showComposer = filter !== "archived" && filter !== "completed";
  const showProgress = filter !== "archived";

  const mainContent = (
    <div className="space-y-7">
      {showProgress ? (
        <TaskProgress completed={progressCompleted} total={progressTotal} />
      ) : null}

      {showComposer ? (
        <div ref={composerRef}>
          <Can permission={PERM.TASKS_CREATE}>
            <TaskComposer
              expandTrigger={composerBump}
              onSubmit={handleQuickCreate}
              pending={mutations.create.isPending}
            />
          </Can>
        </div>
      ) : null}

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
          tasks={workspaceTasks}
          filter={filter}
          selectedId={selectedTaskId}
          onOpen={openTask}
          onToggleComplete={handleToggleComplete}
          {...rowHandlers}
        />
      )}
    </div>
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
          />
        }
        main={mainContent}
        timeline={<ExecutionHistoryPanel groups={executionGroups} onOpen={openTask} />}
      />

      {selectedTaskId ? (
        <TaskEditorSheet open onOpenChange={() => {}}>
          <TaskDetailPanel
            taskId={selectedTaskId}
            detailQuery={detailQuery}
            mutations={mutations}
            onClose={closeDetail}
          />
        </TaskEditorSheet>
      ) : null}
    </>
  );
}
