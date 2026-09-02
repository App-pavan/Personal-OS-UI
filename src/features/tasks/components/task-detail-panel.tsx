import { ClipboardList } from "lucide-react";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { TaskDetailPane } from "@/features/tasks/components/task-detail-pane";
import type { useTaskMutations } from "@/hooks/use-tasks";
import type { TaskDetail } from "@/lib/api/types";

type Mutations = ReturnType<typeof useTaskMutations>;

export function TaskDetailEmptyState() {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
      <ClipboardList
        className="mb-4 size-8 text-[var(--task-text-secondary)] opacity-40"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--task-text-secondary)]">
        Task details
      </p>
      <p className="mt-2 max-w-[220px] text-[13px] leading-relaxed text-[var(--task-text-secondary)]">
        Select a task to view and edit its details.
      </p>
    </div>
  );
}

export function TaskDetailPanel({
  taskId,
  detailQuery,
  mutations,
  onClose,
}: {
  taskId: string | null;
  detailQuery: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    data?: TaskDetail;
    refetch: () => void;
  };
  mutations: Mutations;
  onClose: () => void;
}) {
  if (!taskId) {
    return <TaskDetailEmptyState />;
  }

  if (detailQuery.isLoading) {
    return (
      <div className="p-5">
        <RowsSkeleton rows={8} />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="p-5">
        <ErrorState
          error={detailQuery.error}
          title="Task could not be loaded."
          onRetry={() => detailQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <TaskDetailPane task={detailQuery.data} onClose={onClose} mutations={mutations} />
  );
}
