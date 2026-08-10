import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checklistService } from "@/lib/api/services";
import { errorMessage } from "@/lib/api/errors";
import type {
  ChecklistTemplateItem,
  CreateChecklistInstanceInput,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
} from "@/lib/api/types";

export const checklistKeys = {
  all: ["checklists"] as const,
  templates: ["checklists", "templates"] as const,
  template: (id: string) => ["checklists", "templates", id] as const,
  instances: ["checklists", "instances"] as const,
  instance: (id: string) => ["checklists", "instances", id] as const,
};

export function useChecklistTemplates() {
  return useQuery({
    queryKey: checklistKeys.templates,
    queryFn: () => checklistService.listTemplates(),
    retry: 1,
  });
}

export function useChecklistTemplate(id: string | null) {
  return useQuery({
    queryKey: checklistKeys.template(id ?? "none"),
    queryFn: () => checklistService.getTemplate(id!),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useChecklistInstances() {
  return useQuery({
    queryKey: checklistKeys.instances,
    queryFn: () => checklistService.listInstances(),
    retry: 1,
  });
}

export function useChecklistInstance(id: string | null) {
  return useQuery({
    queryKey: checklistKeys.instance(id ?? "none"),
    queryFn: () => checklistService.getInstance(id!),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useChecklistMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: checklistKeys.all });
  const fail = (fallback: string) => (error: unknown) =>
    toast.error(errorMessage(error, fallback));

  const m = <TVars, TData>(fn: (vars: TVars) => Promise<TData>, fallback: string) =>
    useMutation({ mutationFn: fn, onSuccess: done, onError: fail(fallback) });

  return {
    /* instances */
    start: m(
      (input: CreateChecklistInstanceInput) => checklistService.startInstance(input),
      "Checklist could not be started.",
    ),
    toggleItem: m(
      (vars: { id: string; itemId: string }) => checklistService.toggleItem(vars.id, vars.itemId),
      "Item could not be updated.",
    ),
    checkAllRequired: m(
      (id: string) => checklistService.checkAllRequired(id),
      "Required items could not be checked.",
    ),
    uncheckAll: m((id: string) => checklistService.uncheckAll(id), "Items could not be cleared."),
    complete: m(
      (id: string) => checklistService.completeInstance(id),
      "Checklist could not be completed.",
    ),
    reset: m((id: string) => checklistService.resetInstance(id), "Checklist could not be reset."),
    cancel: m((id: string) => checklistService.cancelInstance(id), "Checklist could not be cancelled."),
    duplicateInstance: m(
      (id: string) => checklistService.duplicateInstance(id),
      "Checklist could not be duplicated.",
    ),
    assignItem: m(
      (vars: { id: string; itemId: string; assigneeName: string }) =>
        checklistService.assignItem(vars.id, vars.itemId, vars.assigneeName),
      "Assignment could not be saved.",
    ),
    convertItemToTask: m(
      (vars: { id: string; itemId: string }) =>
        checklistService.convertItemToTask(vars.id, vars.itemId),
      "Task could not be created from this item.",
    ),

    /* templates */
    createTemplate: m(
      (input: CreateChecklistTemplateInput) => checklistService.createTemplate(input),
      "Checklist could not be created.",
    ),
    updateTemplate: m(
      (vars: { id: string; input: UpdateChecklistTemplateInput }) =>
        checklistService.updateTemplate(vars.id, vars.input),
      "Checklist could not be updated.",
    ),
    duplicateTemplate: m(
      (id: string) => checklistService.duplicateTemplate(id),
      "Checklist could not be duplicated.",
    ),
    archiveTemplate: m(
      (id: string) => checklistService.archiveTemplate(id),
      "Checklist could not be archived.",
    ),
    restoreTemplate: m(
      (id: string) => checklistService.restoreTemplate(id),
      "Checklist could not be restored.",
    ),
    saveTemplateItem: m(
      (vars: { templateId: string; item: Partial<ChecklistTemplateItem> & { title: string } }) =>
        checklistService.saveTemplateItem(vars.templateId, vars.item),
      "Item could not be saved.",
    ),
    removeTemplateItem: m(
      (vars: { templateId: string; itemId: string }) =>
        checklistService.removeTemplateItem(vars.templateId, vars.itemId),
      "Item could not be removed.",
    ),
    reorderTemplateItems: m(
      (vars: { templateId: string; itemIds: string[] }) =>
        checklistService.reorderTemplateItems(vars.templateId, vars.itemIds),
      "Order could not be saved.",
    ),
  };
}
