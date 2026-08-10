import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistService } from "@/lib/api/services";
import type { CreateChecklistInstanceInput } from "@/lib/api/types";

export const checklistKeys = {
  all: ["checklists"] as const,
  templates: ["checklists", "templates"] as const,
  template: (id: string) => ["checklists", "templates", id] as const,
  instances: ["checklists", "instances"] as const,
  instance: (id: string) => ["checklists", "instances", id] as const,
};

export function useChecklistTemplates() {
  return useQuery({ queryKey: checklistKeys.templates, queryFn: () => checklistService.listTemplates() });
}

export function useChecklistTemplate(id: string | null) {
  return useQuery({
    queryKey: checklistKeys.template(id ?? "none"),
    queryFn: () => checklistService.getTemplate(id!),
    enabled: Boolean(id),
  });
}

export function useChecklistInstances() {
  return useQuery({ queryKey: checklistKeys.instances, queryFn: () => checklistService.listInstances() });
}

export function useChecklistInstance(id: string | null) {
  return useQuery({
    queryKey: checklistKeys.instance(id ?? "none"),
    queryFn: () => checklistService.getInstance(id!),
    enabled: Boolean(id),
  });
}

export function useChecklistMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: checklistKeys.all });

  return {
    start: useMutation({
      mutationFn: (input: CreateChecklistInstanceInput) => checklistService.startInstance(input),
      onSuccess: done,
    }),
    toggleItem: useMutation({
      mutationFn: (vars: { id: string; itemId: string }) =>
        checklistService.toggleItem(vars.id, vars.itemId),
      onSuccess: done,
    }),
    checkAllRequired: useMutation({
      mutationFn: (id: string) => checklistService.checkAllRequired(id),
      onSuccess: done,
    }),
    uncheckAll: useMutation({
      mutationFn: (id: string) => checklistService.uncheckAll(id),
      onSuccess: done,
    }),
    complete: useMutation({
      mutationFn: (id: string) => checklistService.completeInstance(id),
      onSuccess: done,
    }),
    reset: useMutation({
      mutationFn: (id: string) => checklistService.resetInstance(id),
      onSuccess: done,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => checklistService.cancelInstance(id),
      onSuccess: done,
    }),
    assignItem: useMutation({
      mutationFn: (vars: { id: string; itemId: string; assigneeName: string }) =>
        checklistService.assignItem(vars.id, vars.itemId, vars.assigneeName),
      onSuccess: done,
    }),
    convertItemToTask: useMutation({
      mutationFn: (vars: { id: string; itemId: string }) =>
        checklistService.convertItemToTask(vars.id, vars.itemId),
      onSuccess: done,
    }),
    duplicateTemplate: useMutation({
      mutationFn: (id: string) => checklistService.duplicateTemplate(id),
      onSuccess: done,
    }),
  };
}
