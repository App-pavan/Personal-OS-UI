import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/lib/api/services";
import type { CreateTaskInput, TaskListQuery, UpdateTaskInput } from "@/lib/api/types";

/* UI never touches services directly — only these hooks. */

export const taskKeys = {
  all: ["tasks"] as const,
  list: (query: TaskListQuery) => ["tasks", "list", query] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

export function useTasks(query: TaskListQuery = {}) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => taskService.list(query),
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? "none"),
    queryFn: () => taskService.get(id!),
    enabled: Boolean(id),
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: taskKeys.all });

  const wrap = <TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<unknown>) =>
    useMutation({ mutationFn: (args: TArgs) => fn(...args), onSuccess: done });

  return {
    create: useMutation({
      mutationFn: (input: CreateTaskInput) => taskService.create(input),
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; input: UpdateTaskInput }) =>
        taskService.update(vars.id, vars.input),
      onSuccess: done,
    }),
    complete: wrap((id: string) => taskService.complete(id)),
    reopen: wrap((id: string) => taskService.reopen(id)),
    archive: wrap((id: string) => taskService.archive(id)),
    restore: wrap((id: string) => taskService.restore(id)),
    duplicate: wrap((id: string) => taskService.duplicate(id)),
    pin: wrap((id: string, pinned: boolean) => taskService.setPinned(id, pinned)),
    favorite: wrap((id: string, favorite: boolean) => taskService.setFavorite(id, favorite)),
    progress: wrap((id: string, progress: number) => taskService.setProgress(id, progress)),
    assign: wrap((id: string, name: string) => taskService.assign(id, name)),
    addSubtask: wrap((id: string, title: string) => taskService.addSubtask(id, title)),
    toggleSubtask: wrap((id: string, subId: string) => taskService.toggleSubtask(id, subId)),
    toggleChecklistItem: wrap((id: string, itemId: string) =>
      taskService.toggleChecklistItem(id, itemId),
    ),
    comment: wrap((id: string, body: string) => taskService.addComment(id, body)),
  };
}
