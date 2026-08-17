import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { List, Rows3 } from "lucide-react";
import { SectionHeader } from "@/components/future";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { TaskExecutionTimeline } from "@/features/tasks/components/task-execution-timeline";
import { TaskListView } from "@/features/tasks/components/task-list-view";
import {
  TaskDateNavigator,
  TaskQuickCreate,
  TaskSummaryBar,
} from "@/features/tasks/components/task-controls";
import { TaskDetailPane } from "@/features/tasks/components/task-detail-pane";
import {
  buildDateTimeline,
  dateKey,
  defaultDueForDate,
  startOfDay,
  summarizeTasks,
  type TimelineFilter,
} from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { z } from "zod";

const tasksSearchSchema = z.object({
  taskId: z.string().optional(),
  filter: z.enum(["all", "today", "upcoming", "overdue"]).optional(),
});

export const Route = createFileRoute("/tasks")({
  validateSearch: (search) => tasksSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Tasks — Personal OS" }] }),
  component: TasksPage,
});

type ViewMode = "timeline" | "list";

function TasksPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { taskId: selectedTaskId = null, filter: searchFilter } = Route.useSearch();
  const filter: TimelineFilter = searchFilter ?? "all";

  const tasksQuery = useTasks({ perPage: 200 });
  const tasks = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data]);
  const mutations = useTaskMutations();
  const detailQuery = useTask(selectedTaskId);

  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [focusDate, setFocusDate] = useState(() => startOfDay());
  const [focusDateKey, setFocusDateKey] = useState<string | undefined>("scroll-today");

  const summary = useMemo(() => summarizeTasks(tasks), [tasks]);
  const sections = useMemo(() => buildDateTimeline(tasks, filter), [tasks, filter]);

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

  const jumpToToday = useCallback(() => {
    setFocusDate(startOfDay());
    setFocusDateKey("scroll-today");
    setFilter("today");
  }, [setFilter]);

  const onFocusDateChange = useCallback((date: Date) => {
    setFocusDate(startOfDay(date));
    setFocusDateKey(dateKey(startOfDay(date)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <SectionHeader
        system="Tasks"
        module="Personal execution"
        title="Execution timeline"
        subtitle="Your commitments, organized around time."
      />

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="space-y-4 rounded-xl border border-hairline/60 bg-surface/20 p-4 sm:p-5">
            <TaskSummaryBar
              today={summary.today}
              overdue={summary.overdue}
              upcoming={summary.upcoming}
            />

            <TaskQuickCreate
              dueAt={defaultDueForDate(focusDate)}
              onSubmit={handleQuickCreate}
              pending={mutations.create.isPending}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["all", "All"],
                    ["today", "Today"],
                    ["upcoming", "Upcoming"],
                    ["overdue", "Overdue"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={filter === key ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 rounded-md px-2.5 text-[11px] font-medium uppercase tracking-wide",
                      filter === key && "bg-primary/15 text-primary",
                    )}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-1 rounded-md border border-hairline/60 p-0.5">
                <Button
                  type="button"
                  variant={viewMode === "timeline" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => setViewMode("timeline")}
                >
                  <Rows3 className="h-3.5 w-3.5" />
                  Timeline
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </Button>
              </div>
            </div>

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

          <div className="mt-4 pb-8">
            {tasksQuery.isLoading ? (
              <RowsSkeleton rows={6} />
            ) : tasksQuery.isError ? (
              <ErrorState
                error={tasksQuery.error}
                title="Unable to load tasks."
                onRetry={() => tasksQuery.refetch()}
              />
            ) : viewMode === "timeline" ? (
              <TaskExecutionTimeline
                sections={sections}
                focusDateKey={focusDateKey}
                selectedId={selectedTaskId}
                onOpen={openTask}
                onToggleComplete={handleToggleComplete}
              />
            ) : (
              <TaskListView
                tasks={tasks}
                filter={filter}
                selectedId={selectedTaskId}
                onOpen={openTask}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </div>
        </div>

        {selectedTaskId ? (
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[380px]">
            <div className="rounded-xl border border-hairline/60 bg-surface/30 p-4 sm:p-5">
              {detailQuery.isLoading ? (
                <RowsSkeleton rows={8} />
              ) : detailQuery.isError || !detailQuery.data ? (
                <ErrorState
                  error={detailQuery.error}
                  title="Task could not be loaded."
                  onRetry={() => detailQuery.refetch()}
                />
              ) : (
                <TaskDetailPane
                  task={detailQuery.data}
                  onClose={closeDetail}
                  mutations={mutations}
                />
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
