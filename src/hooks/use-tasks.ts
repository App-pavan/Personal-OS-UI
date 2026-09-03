import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { PERM } from "@/lib/permissions";
import { taskService } from "@/lib/api/services";
import { errorMessage } from "@/lib/api/errors";
import type {
  BulkTaskOperation,
  CreateTaskInput,
  TaskListQuery,
  UpdateTaskInput,
} from "@/lib/api/types";

/* UI never touches services directly — only these hooks. */

export const taskKeys = {
  all: ["tasks"] as const,
  list: (query: TaskListQuery) => ["tasks", "list", query] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

export function useTasks(query: TaskListQuery = {}, options?: { enabled?: boolean }) {
  const { can, isReady } = useCapabilities();
  const allowed = isReady && can(PERM.TASKS_VIEW);
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => taskService.list(query),
    enabled: allowed && (options?.enabled ?? true),
    retry: 1,
  });
}

export function useTask(id: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: taskKeys.detail(id ?? "none"),
    queryFn: () => taskService.get(id!),
    enabled: Boolean(id) && isReady && can(PERM.TASKS_VIEW),
    retry: 1,
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: taskKeys.all });
  const fail = (fallback: string) => (error: unknown) =>
    toast.error(errorMessage(error, fallback));

  const wrap = <TArgs extends unknown[]>(
    fn: (...args: TArgs) => Promise<unknown>,
    fallback: string,
  ) =>
    useMutation({
      mutationFn: (args: TArgs) => fn(...args),
      onSuccess: done,
      onError: fail(fallback),
    });

  return {
    create: useMutation({
      mutationFn: (input: CreateTaskInput) => taskService.create(input),
      onSuccess: done,
      onError: fail("Task could not be created."),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; input: UpdateTaskInput }) =>
        taskService.update(vars.id, vars.input),
      onSuccess: done,
      onError: fail("Changes could not be saved."),
    }),
    remove: wrap((id: string) => taskService.remove(id), "Task could not be deleted."),
    bulk: wrap((op: BulkTaskOperation) => taskService.bulk(op), "Bulk action could not be applied."),
    complete: wrap((id: string) => taskService.complete(id), "Task could not be completed."),
    reopen: wrap((id: string) => taskService.reopen(id), "Task could not be reopened."),
    markNotCompleted: wrap(
      (id: string) => taskService.markNotCompleted(id),
      "Task could not be marked not completed.",
    ),
    archive: wrap((id: string) => taskService.archive(id), "Task could not be archived."),
    restore: wrap((id: string) => taskService.restore(id), "Task could not be restored."),
    duplicate: wrap((id: string) => taskService.duplicate(id), "Task could not be duplicated."),
    pin: wrap((id: string, pinned: boolean) => taskService.setPinned(id, pinned), "Pin failed."),
    favorite: wrap(
      (id: string, favorite: boolean) => taskService.setFavorite(id, favorite),
      "Favorite failed.",
    ),
    progress: wrap(
      (id: string, progress: number) => taskService.setProgress(id, progress),
      "Progress could not be saved.",
    ),
    assign: wrap(
      (id: string, name: string) => taskService.assign(id, name),
      "Assignment could not be saved.",
    ),
    addSubtask: wrap(
      (id: string, title: string) => taskService.addSubtask(id, title),
      "Subtask could not be added.",
    ),
    toggleSubtask: wrap(
      (id: string, subId: string) => taskService.toggleSubtask(id, subId),
      "Subtask could not be updated.",
    ),
    toggleChecklistItem: wrap(
      (id: string, itemId: string) => taskService.toggleChecklistItem(id, itemId),
      "Item could not be updated.",
    ),
    comment: wrap(
      (id: string, body: string) => taskService.addComment(id, body),
      "Comment could not be posted.",
    ),
  };
}
