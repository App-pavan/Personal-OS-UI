import { api, buildQuery } from "./client";
import type {
  BulkTaskOperation,
  ChecklistInstance,
  ChecklistInstanceDetail,
  ChecklistTemplate,
  ChecklistTemplateDetail,
  ChecklistTemplateItem,
  CreateChecklistInstanceInput,
  CreateChecklistTemplateInput,
  CreateTaskInput,
  Paginated,
  TaskDetail,
  TaskListQuery,
  TaskSummary,
  UpdateChecklistTemplateInput,
  UpdateTaskInput,
} from "./types";

/* ---------------------------------------------------------------
 * Service boundary.
 *
 * Components never import mock data. They call hooks, hooks call
 * these interfaces. Flip `USE_MOCK` (or the registry below) in the
 * integration phase and the UI is untouched.
 * ------------------------------------------------------------- */

export interface TaskService {
  list(query?: TaskListQuery): Promise<Paginated<TaskSummary>>;
  get(id: string): Promise<TaskDetail>;
  create(input: CreateTaskInput): Promise<TaskDetail>;
  update(id: string, input: UpdateTaskInput): Promise<TaskDetail>;
  remove(id: string): Promise<void>;
  bulk(op: BulkTaskOperation): Promise<void>;
  complete(id: string): Promise<TaskDetail>;
  reopen(id: string): Promise<TaskDetail>;
  archive(id: string): Promise<TaskDetail>;
  restore(id: string): Promise<TaskDetail>;
  duplicate(id: string): Promise<TaskDetail>;
  assign(id: string, assigneeName: string): Promise<TaskDetail>;
  setProgress(id: string, progress: number): Promise<TaskDetail>;
  setPinned(id: string, pinned: boolean): Promise<TaskDetail>;
  setFavorite(id: string, favorite: boolean): Promise<TaskDetail>;
  addSubtask(id: string, title: string): Promise<TaskDetail>;
  toggleSubtask(id: string, subtaskId: string): Promise<TaskDetail>;
  toggleChecklistItem(id: string, itemId: string): Promise<TaskDetail>;
  addComment(id: string, body: string): Promise<TaskDetail>;
}

export interface ChecklistService {
  listTemplates(): Promise<ChecklistTemplate[]>;
  getTemplate(id: string): Promise<ChecklistTemplateDetail>;
  createTemplate(input: CreateChecklistTemplateInput): Promise<ChecklistTemplateDetail>;
  updateTemplate(id: string, input: UpdateChecklistTemplateInput): Promise<ChecklistTemplateDetail>;
  duplicateTemplate(id: string): Promise<ChecklistTemplateDetail>;
  archiveTemplate(id: string): Promise<ChecklistTemplateDetail>;
  restoreTemplate(id: string): Promise<ChecklistTemplateDetail>;
  saveTemplateItem(
    templateId: string,
    item: Partial<ChecklistTemplateItem> & { title: string },
  ): Promise<ChecklistTemplateDetail>;
  removeTemplateItem(templateId: string, itemId: string): Promise<ChecklistTemplateDetail>;
  reorderTemplateItems(templateId: string, itemIds: string[]): Promise<ChecklistTemplateDetail>;

  listInstances(): Promise<ChecklistInstance[]>;
  getInstance(id: string): Promise<ChecklistInstanceDetail>;
  startInstance(input: CreateChecklistInstanceInput): Promise<ChecklistInstanceDetail>;
  completeInstance(id: string): Promise<ChecklistInstanceDetail>;
  cancelInstance(id: string): Promise<ChecklistInstanceDetail>;
  resetInstance(id: string): Promise<ChecklistInstanceDetail>;
  duplicateInstance(id: string): Promise<ChecklistInstanceDetail>;
  toggleItem(id: string, itemId: string): Promise<ChecklistInstanceDetail>;
  checkAllRequired(id: string): Promise<ChecklistInstanceDetail>;
  uncheckAll(id: string): Promise<ChecklistInstanceDetail>;
  assignItem(id: string, itemId: string, assigneeName: string): Promise<ChecklistInstanceDetail>;
  convertItemToTask(id: string, itemId: string): Promise<ChecklistInstanceDetail>;
  recommendations(): Promise<ChecklistTemplate[]>;
}

/* ---------------- live task service ---------------- */

class ApiTaskService implements TaskService {
  async list(query: TaskListQuery = {}) {
    const res = await api.get<TaskSummary[]>("/tasks", query as Record<string, never>);
    return {
      items: res.data,
      meta: res.meta ?? { page: 1, perPage: res.data.length, total: res.data.length, totalPages: 1 },
    };
  }
  get = async (id: string) => (await api.get<TaskDetail>(`/tasks/${id}`)).data;
  create = async (input: CreateTaskInput) => (await api.post<TaskDetail>("/tasks", input)).data;
  update = async (id: string, input: UpdateTaskInput) =>
    (await api.patch<TaskDetail>(`/tasks/${id}`, input)).data;
  remove = async (id: string) => {
    await api.delete<null>(`/tasks/${id}`);
  };
  bulk = async (op: BulkTaskOperation) => {
    await api.post<null>("/tasks/bulk", op);
  };
  complete = async (id: string) => (await api.post<TaskDetail>(`/tasks/${id}/complete`)).data;
  reopen = async (id: string) => (await api.post<TaskDetail>(`/tasks/${id}/reopen`)).data;
  archive = async (id: string) => (await api.post<TaskDetail>(`/tasks/${id}/archive`)).data;
  restore = async (id: string) => (await api.post<TaskDetail>(`/tasks/${id}/restore`)).data;
  duplicate = async (id: string) => (await api.post<TaskDetail>(`/tasks/${id}/duplicate`)).data;
  assign = async (id: string, assigneeName: string) =>
    (await api.post<TaskDetail>(`/tasks/${id}/assign`, { assigneeName })).data;
  setProgress = async (id: string, progress: number) =>
    (await api.post<TaskDetail>(`/tasks/${id}/progress`, { progress })).data;
  setPinned = async (id: string, pinned: boolean) =>
    (await api.post<TaskDetail>(`/tasks/${id}/pin`, { pinned })).data;
  setFavorite = async (id: string, favorite: boolean) =>
    (await api.post<TaskDetail>(`/tasks/${id}/favorite`, { favorite })).data;
  addSubtask = async (id: string, title: string) =>
    (await api.post<TaskDetail>(`/tasks/${id}/subtasks`, { title })).data;
  toggleSubtask = async (id: string, subtaskId: string) =>
    (await api.post<TaskDetail>(`/tasks/${id}/subtasks/${subtaskId}/toggle`)).data;
  toggleChecklistItem = async (id: string, itemId: string) =>
    (await api.post<TaskDetail>(`/tasks/${id}/checklist/${itemId}/toggle`)).data;
  addComment = async (id: string, body: string) =>
    (await api.post<TaskDetail>(`/tasks/${id}/comments`, { body })).data;
}


/* ---------------- live checklist service ---------------- */

class ApiChecklistService implements ChecklistService {
  listTemplates = async () =>
    (await api.get<ChecklistTemplate[]>("/checklists/templates")).data;
  getTemplate = async (id: string) =>
    (await api.get<ChecklistTemplateDetail>(`/checklists/templates/${id}`)).data;
  createTemplate = async (input: CreateChecklistTemplateInput) =>
    (await api.post<ChecklistTemplateDetail>("/checklists/templates", input)).data;
  updateTemplate = async (id: string, input: UpdateChecklistTemplateInput) =>
    (await api.patch<ChecklistTemplateDetail>(`/checklists/templates/${id}`, input)).data;
  duplicateTemplate = async (id: string) =>
    (await api.post<ChecklistTemplateDetail>(`/checklists/templates/${id}/duplicate`)).data;
  archiveTemplate = async (id: string) =>
    (await api.post<ChecklistTemplateDetail>(`/checklists/templates/${id}/archive`)).data;
  restoreTemplate = async (id: string) =>
    (await api.post<ChecklistTemplateDetail>(`/checklists/templates/${id}/restore`)).data;
  saveTemplateItem = async (
    templateId: string,
    item: Partial<ChecklistTemplateItem> & { title: string },
  ) =>
    item.id
      ? (await api.patch<ChecklistTemplateDetail>(
          `/checklists/templates/${templateId}/items/${item.id}`,
          item,
        )).data
      : (await api.post<ChecklistTemplateDetail>(`/checklists/templates/${templateId}/items`, item))
          .data;
  removeTemplateItem = async (templateId: string, itemId: string) =>
    (await api.delete<ChecklistTemplateDetail>(
      `/checklists/templates/${templateId}/items/${itemId}`,
    )).data;
  reorderTemplateItems = async (templateId: string, itemIds: string[]) =>
    (await api.post<ChecklistTemplateDetail>(
      `/checklists/templates/${templateId}/items/reorder`,
      { itemIds },
    )).data;

  listInstances = async () => (await api.get<ChecklistInstance[]>("/checklists/instances")).data;
  getInstance = async (id: string) =>
    (await api.get<ChecklistInstanceDetail>(`/checklists/instances/${id}`)).data;
  startInstance = async (input: CreateChecklistInstanceInput) =>
    (await api.post<ChecklistInstanceDetail>("/checklists/instances", input)).data;
  completeInstance = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/complete`)).data;
  cancelInstance = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/cancel`)).data;
  resetInstance = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/reset`)).data;
  duplicateInstance = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/duplicate`)).data;
  toggleItem = async (id: string, itemId: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/items/${itemId}/toggle`))
      .data;
  checkAllRequired = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/check-all-required`)).data;
  uncheckAll = async (id: string) =>
    (await api.post<ChecklistInstanceDetail>(`/checklists/instances/${id}/uncheck-all`)).data;
  assignItem = async (id: string, itemId: string, assigneeName: string) =>
    (await api.post<ChecklistInstanceDetail>(
      `/checklists/instances/${id}/items/${itemId}/assign`,
      { assigneeName },
    )).data;
  convertItemToTask = async (id: string, itemId: string) =>
    (await api.post<ChecklistInstanceDetail>(
      `/checklists/instances/${id}/items/${itemId}/convert-to-task`,
    )).data;
  recommendations = async () =>
    (await api.get<ChecklistTemplate[]>("/checklists/recommendations")).data;
}

/* ---------------- registry ----------------
 * The backend is the single source of truth. There is no mock
 * implementation in the production path.
 * ------------------------------------------------------------- */

export const taskService: TaskService = new ApiTaskService();
export const checklistService: ChecklistService = new ApiChecklistService();

export { ApiTaskService, ApiChecklistService, buildQuery };
