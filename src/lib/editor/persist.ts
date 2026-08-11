import { checklistService, taskService } from "@/lib/api/services";
import {
  docToTaskDraft,
  docToTemplateInput,
  type EditorDoc,
  type TaskDraftExtras,
} from "@/lib/editor/document";
import type {
  ChecklistCategory,
  ChecklistTemplateDetail,
  TaskDetail,
  UpdateChecklistTemplateInput,
} from "@/lib/api/types";

/* ---------------------------------------------------------------
 * Document → backend. The editor never invents its own storage:
 * everything here lands on the real /api/v1 endpoints.
 * ------------------------------------------------------------- */

export async function createChecklistTemplateFromDoc(doc: EditorDoc, category: ChecklistCategory) {
  return checklistService.createTemplate(docToTemplateInput(doc, category));
}

/**
 * Editing an existing routine: name/description are patched, then
 * items are rewritten in document order using the real item
 * endpoints so positions match what the user sees.
 */
export async function saveChecklistTemplateFromDoc(
  existing: ChecklistTemplateDetail,
  doc: EditorDoc,
  category: ChecklistCategory,
) {
  const input = docToTemplateInput(doc, category);
  const patch: UpdateChecklistTemplateInput = {
    name: input.name,
    category,
    ...(input.description !== undefined ? { description: input.description } : { description: "" }),
  };
  await checklistService.updateTemplate(existing.id, patch);

  for (const item of existing.items) {
    await checklistService.removeTemplateItem(existing.id, item.id);
  }
  for (const item of input.items ?? []) {
    await checklistService.saveTemplateItem(existing.id, item);
  }
  return checklistService.getTemplate(existing.id);
}

export async function createTaskFromDoc(doc: EditorDoc, extras: TaskDraftExtras) {
  const { input, steps } = docToTaskDraft(doc, extras);
  let task = await taskService.create(input);
  for (const step of steps) task = await taskService.addSubtask(task.id, step);
  return task;
}

/**
 * Steps already on the task stay put (the API has no subtask
 * delete); new lines in the document become new steps.
 */
export async function saveTaskFromDoc(
  existing: TaskDetail,
  doc: EditorDoc,
  extras: TaskDraftExtras,
) {
  const { input, steps } = docToTaskDraft(doc, extras);
  let task = await taskService.update(existing.id, {
    title: input.title,
    description: input.description ?? "",
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.dueAt ? { dueAt: input.dueAt } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
  });
  const known = new Set(existing.subtasks.map((s) => s.title.trim().toLowerCase()));
  for (const step of steps) {
    if (known.has(step.trim().toLowerCase())) continue;
    task = await taskService.addSubtask(existing.id, step);
  }
  return task;
}
