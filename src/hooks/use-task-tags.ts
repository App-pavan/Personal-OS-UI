import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  createTag,
  ensureTagInStore,
  listStoredTags,
  syncTagsFromTasks,
} from "@/features/tasks/lib/task-tag-store";
import {
  getTaskTagId,
  getVisibleTaskTagId,
  isGeneralTag,
  tagsPayloadForAssignment,
  type TaskTag,
} from "@/features/tasks/lib/task-tags";
import { useTaskMutations } from "@/hooks/use-tasks";
import type { TaskSummary } from "@/lib/api/types";

let tagListeners = new Set<() => void>();

/** Stable snapshot reference — required by useSyncExternalStore. */
let tagSnapshot: TaskTag[] = listStoredTags();

function refreshTagSnapshot(): TaskTag[] {
  tagSnapshot = listStoredTags();
  return tagSnapshot;
}

function subscribeTags(cb: () => void) {
  tagListeners.add(cb);
  return () => tagListeners.delete(cb);
}

export function notifyTaskTagListeners() {
  refreshTagSnapshot();
  tagListeners.forEach((cb) => cb());
}

function getTagSnapshot(): TaskTag[] {
  return tagSnapshot;
}

/** Subscribe to the tag registry. Call useSyncTaskTagsFromList once at page level. */
export function useTaskTagRegistry(): TaskTag[] {
  return useSyncExternalStore(subscribeTags, getTagSnapshot, getTagSnapshot);
}

/** Sync tag names from the loaded task list — call once from the Tasks page. */
export function useSyncTaskTagsFromList(tasks: TaskSummary[]) {
  const tagIdsKey = useMemo(
    () =>
      tasks
        .map((t) => getTaskTagId(t))
        .filter((id) => !isGeneralTag(id))
        .sort()
        .join("|"),
    [tasks],
  );

  useEffect(() => {
    if (!tagIdsKey) return;
    const changed = syncTagsFromTasks(tagIdsKey.split("|"));
    if (changed) notifyTaskTagListeners();
  }, [tagIdsKey]);
}

export function useTaskTagAssignment() {
  const mutations = useTaskMutations();

  const assignTag = useCallback(
    (taskId: string, tagId: string, options?: { onSuccess?: () => void }) => {
      mutations.update.mutate(
        { id: taskId, input: { tags: tagsPayloadForAssignment(tagId) } },
        {
          onSuccess: () => {
            ensureTagInStore(tagId);
            notifyTaskTagListeners();
            options?.onSuccess?.();
          },
          onError: () => toast.error("Couldn't assign tag. Try again."),
        },
      );
    },
    [mutations.update],
  );

  const createAndAssign = useCallback(
    (taskId: string, name: string) => {
      try {
        const tag = createTag(name);
        notifyTaskTagListeners();
        assignTag(taskId, tag.id);
        return tag;
      } catch {
        toast.error("Couldn't create tag. Try again.");
        return null;
      }
    },
    [assignTag],
  );

  return { assignTag, createAndAssign, isPending: mutations.update.isPending };
}

export function useTaskTag(task: Pick<TaskSummary, "tags">, registry: TaskTag[]) {
  const visibleId = getVisibleTaskTagId(task);
  const tag = visibleId ? registry.find((t) => t.id === visibleId) ?? null : null;
  return { tag, visibleId };
}
