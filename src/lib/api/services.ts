import { api, buildQuery } from "./client";
import {
  fromBackendTemplate,
  fromBackendTemplateDetail,
  toBackendCreateTemplateInput,
  toBackendTemplateItem,
  toBackendUpdateTemplateInput,
} from "./checklist-mapper";
import {
  fromBackendInstance,
  fromBackendInstanceDetail,
  toBackendCreateInstanceInput,
} from "./instance-mapper";
import { priorityFromBackend, priorityToBackend } from "./priority";
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
  private normalizeTask = <T extends TaskDetail | TaskSummary>(task: T): T => ({
    ...task,
    priority: priorityFromBackend(task.priority),
  });

  async list(query: TaskListQuery = {}) {
    const res = await api.get<TaskSummary[]>("/tasks", query as Record<string, never>);
    return {
      items: res.data.map((task) => this.normalizeTask(task)),
      meta: res.meta ?? { page: 1, perPage: res.data.length, total: res.data.length, totalPages: 1 },
    };
  }
  get = async (id: string) => this.normalizeTask((await api.get<TaskDetail>(`/tasks/${id}`)).data);
  create = async (input: CreateTaskInput) =>
    this.normalizeTask(
      (
        await api.post<TaskDetail>("/tasks", {
          ...input,
          ...(input.priority ? { priority: priorityToBackend(input.priority) } : {}),
        })
      ).data,
    );
  update = async (id: string, input: UpdateTaskInput) =>
    this.normalizeTask(
      (
        await api.patch<TaskDetail>(`/tasks/${id}`, {
          ...input,
          ...(input.priority ? { priority: priorityToBackend(input.priority) } : {}),
        })
      ).data,
    );
  remove = async (id: string) => {
    await api.delete<null>(`/tasks/${id}`);
  };
  bulk = async (op: BulkTaskOperation) => {
    await api.post<null>("/tasks/bulk", op);
  };
  complete = async (id: string) => this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/complete`)).data);
  reopen = async (id: string) => this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/reopen`)).data);
  archive = async (id: string) => this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/archive`)).data);
  restore = async (id: string) => this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/restore`)).data);
  duplicate = async (id: string) => this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/duplicate`)).data);
  assign = async (id: string, assigneeName: string) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/assign`, { assigneeName })).data);
  setProgress = async (id: string, progress: number) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/progress`, { progress })).data);
  setPinned = async (id: string, pinned: boolean) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/pin`, { pinned })).data);
  setFavorite = async (id: string, favorite: boolean) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/favorite`, { favorite })).data);
  addSubtask = async (id: string, title: string) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/subtasks`, { title })).data);
  toggleSubtask = async (id: string, subtaskId: string) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/subtasks/${subtaskId}/toggle`)).data);
  toggleChecklistItem = async (id: string, itemId: string) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/checklist/${itemId}/toggle`)).data);
  addComment = async (id: string, body: string) =>
    this.normalizeTask((await api.post<TaskDetail>(`/tasks/${id}/comments`, { body })).data);
}


/* ---------------- live checklist service ---------------- */

class ApiChecklistService implements ChecklistService {
  listTemplates = async () =>
    (await api.get<Record<string, unknown>[]>("/checklists/templates")).data.map((raw) =>
      fromBackendTemplate(raw),
    );
  getTemplate = async (id: string) =>
    fromBackendTemplateDetail((await api.get<Record<string, unknown>>(`/checklists/templates/${id}`)).data);
  createTemplate = async (input: CreateChecklistTemplateInput) =>
    fromBackendTemplateDetail(
      (await api.post<Record<string, unknown>>("/checklists/templates", toBackendCreateTemplateInput(input)))
        .data,
    );
  updateTemplate = async (id: string, input: UpdateChecklistTemplateInput) =>
    fromBackendTemplateDetail(
      (
        await api.patch<Record<string, unknown>>(
          `/checklists/templates/${id}`,
          toBackendUpdateTemplateInput(input),
        )
      ).data,
    );
  duplicateTemplate = async (id: string) =>
    fromBackendTemplateDetail(
      (await api.post<Record<string, unknown>>(`/checklists/templates/${id}/duplicate`)).data,
    );
  archiveTemplate = async (id: string) =>
    fromBackendTemplateDetail(
      (await api.post<Record<string, unknown>>(`/checklists/templates/${id}/archive`)).data,
    );
  restoreTemplate = async (id: string) =>
    fromBackendTemplateDetail(
      (await api.post<Record<string, unknown>>(`/checklists/templates/${id}/restore`)).data,
    );
  saveTemplateItem = async (
    templateId: string,
    item: Partial<ChecklistTemplateItem> & { title: string },
  ) => {
    const body = toBackendTemplateItem(item);
    return fromBackendTemplateDetail(
      item.id
        ? (
            await api.patch<Record<string, unknown>>(
              `/checklists/templates/${templateId}/items/${item.id}`,
              body,
            )
          ).data
        : (await api.post<Record<string, unknown>>(`/checklists/templates/${templateId}/items`, body))
            .data,
    );
  };
  removeTemplateItem = async (templateId: string, itemId: string) =>
    fromBackendTemplateDetail(
      (
        await api.delete<Record<string, unknown>>(
          `/checklists/templates/${templateId}/items/${itemId}`,
        )
      ).data,
    );
  reorderTemplateItems = async (templateId: string, itemIds: string[]) =>
    fromBackendTemplateDetail(
      (
        await api.post<Record<string, unknown>>(
          `/checklists/templates/${templateId}/items/reorder`,
          { itemIds },
        )
      ).data,
    );

  listInstances = async () =>
    (await api.get<Record<string, unknown>[]>("/checklists/instances")).data.map((raw) =>
      fromBackendInstance(raw),
    );
  getInstance = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.get<Record<string, unknown>>(`/checklists/instances/${id}`)).data,
    );
  startInstance = async (input: CreateChecklistInstanceInput) =>
    fromBackendInstanceDetail(
      (
        await api.post<Record<string, unknown>>(
          "/checklists/instances",
          toBackendCreateInstanceInput(input),
        )
      ).data,
    );
  completeInstance = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/complete`)).data,
    );
  cancelInstance = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/cancel`)).data,
    );
  resetInstance = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/reset`)).data,
    );
  duplicateInstance = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/duplicate`)).data,
    );
  toggleItem = async (id: string, itemId: string) =>
    fromBackendInstanceDetail(
      (
        await api.post<Record<string, unknown>>(`/checklists/instances/${id}/toggle-item`, {
          itemId,
        })
      ).data,
    );
  checkAllRequired = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/check-all-required`))
        .data,
    );
  uncheckAll = async (id: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/uncheck-all`)).data,
    );
  assignItem = async (id: string, itemId: string, assigneeName: string) =>
    fromBackendInstanceDetail(
      (
        await api.post<Record<string, unknown>>(
          `/checklists/instances/${id}/items/${itemId}/assign`,
          { assigneeId: assigneeName },
        )
      ).data,
    );
  convertItemToTask = async (id: string, itemId: string) =>
    fromBackendInstanceDetail(
      (await api.post<Record<string, unknown>>(`/checklists/instances/${id}/items/${itemId}/task`))
        .data,
    );
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
