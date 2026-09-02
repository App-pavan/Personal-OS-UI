import { useCallback, useEffect, useSyncExternalStore } from "react";
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

function subscribeTags(cb: () => void) {
  tagListeners.add(cb);
  return () => tagListeners.delete(cb);
}

function notifyTagListeners() {
  tagListeners.forEach((cb) => cb());
}

function getTagSnapshot() {
  return listStoredTags();
}

export function useTaskTagRegistry(tasks: TaskSummary[] = []) {
  const tags = useSyncExternalStore(subscribeTags, getTagSnapshot, getTagSnapshot);

  useEffect(() => {
    syncTagsFromTasks(tasks.map((t) => getTaskTagId(t)).filter((id) => !isGeneralTag(id)));
    notifyTagListeners();
  }, [tasks]);

  const registerTag = useCallback((name: string): TaskTag => {
    const tag = createTag(name);
    notifyTagListeners();
    return tag;
  }, []);

  const resolveTag = useCallback((tagId: string | null | undefined): TaskTag | null => {
    if (!tagId || isGeneralTag(tagId)) return null;
    return ensureTagInStore(tagId);
  }, []);

  return { tags, registerTag, resolveTag };
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
            notifyTagListeners();
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
        notifyTagListeners();
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
  const tag = visibleId
    ? (registry.find((t) => t.id === visibleId) ?? ensureTagInStore(visibleId))
    : null;
  return { tag, visibleId };
}
