import { api, buildQuery } from "./client";
import { seedInstances, seedTasks, seedTemplates } from "./mock/seed";
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

/* ---------------- helpers ---------------- */

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
const summarize = (t: TaskDetail): TaskSummary => {
  const { subtasks, checklist, dependencies, attachments, links, reminders, comments, timeline, entityLinks, aiContext, description, ...summary } =
    t;
  void subtasks;
  void checklist;
  void dependencies;
  void attachments;
  void links;
  void reminders;
  void comments;
  void timeline;
  void entityLinks;
  void aiContext;
  void description;
  return summary;
};

/* ---------------- mock task service ---------------- */

class MockTaskService implements TaskService {
  private tasks: TaskDetail[] = clone(seedTasks);

  private find(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task ${id} not found`);
    return task;
  }

  private touch(task: TaskDetail, action: string, description: string) {
    task.updatedAt = new Date().toISOString();
    task.timeline = [
      { id: uid("act"), action, description, createdAt: task.updatedAt },
      ...task.timeline,
    ];
    return clone(task);
  }

  async list(query: TaskListQuery = {}): Promise<Paginated<TaskSummary>> {
    await delay(60);
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 50;
    let items = this.tasks.filter((t) => (query.archived ? t.archived : !t.archived));
    if (query.status?.length) items = items.filter((t) => query.status!.includes(t.status));
    if (query.type?.length) items = items.filter((t) => query.type!.includes(t.type));
    if (query.priority?.length) items = items.filter((t) => query.priority!.includes(t.priority));
    if (query.pinned) items = items.filter((t) => t.pinned);
    if (query.favorite) items = items.filter((t) => t.favorite);
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (t) => t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)),
      );
    }
    const total = items.length;
    const start = (page - 1) * perPage;
    return {
      items: clone(items.slice(start, start + perPage)).map(summarize),
      meta: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) },
    };
  }

  async get(id: string) {
    await delay(40);
    return clone(this.find(id));
  }

  async create(input: CreateTaskInput) {
    await delay();
    const now = new Date().toISOString();
    const task: TaskDetail = {
      id: uid("tsk"),
      title: input.title,
      type: input.type ?? "personal",
      status: input.status ?? "inbox",
      priority: input.priority ?? "normal",
      progress: 0,
      pinned: false,
      favorite: false,
      archived: false,
      tags: input.tags ?? [],
      labels: [],
      subtaskCount: 0,
      subtaskCompletedCount: 0,
      checklistItemCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      dependencyCount: 0,
      hasReminder: false,
      createdAt: now,
      updatedAt: now,
      subtasks: [],
      checklist: [],
      dependencies: [],
      attachments: [],
      links: [],
      reminders: [],
      comments: [],
      timeline: [{ id: uid("act"), action: "created", description: "Task captured", createdAt: now }],
      entityLinks: [],
      ...(input.description ? { description: input.description } : {}),
      ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      ...(input.startAt ? { startAt: input.startAt } : {}),
    };
    this.tasks = [task, ...this.tasks];
    return clone(task);
  }

  async update(id: string, input: UpdateTaskInput) {
    await delay(60);
    const task = this.find(id);
    Object.assign(task, input);
    return this.touch(task, "updated", "Task updated");
  }

  async remove(id: string) {
    await delay(60);
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  async bulk(op: BulkTaskOperation) {
    await delay(80);
    for (const id of op.ids) {
      if (op.action === "delete") {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        continue;
      }
      const task = this.tasks.find((t) => t.id === id);
      if (!task) continue;
      if (op.action === "complete") task.status = "completed";
      if (op.action === "reopen") task.status = "ready";
      if (op.action === "archive") task.archived = true;
      if (op.action === "restore") task.archived = false;
    }
  }

  async complete(id: string) {
    await delay(40);
    const task = this.find(id);
    task.status = "completed";
    task.progress = 100;
    task.completedAt = new Date().toISOString();
    return this.touch(task, "completed", "Task completed");
  }

  async reopen(id: string) {
    await delay(40);
    const task = this.find(id);
    task.status = "ready";
    delete task.completedAt;
    return this.touch(task, "reopened", "Task reopened");
  }

  async archive(id: string) {
    await delay(40);
    const task = this.find(id);
    task.archived = true;
    task.status = "archived";
    return this.touch(task, "archived", "Task archived");
  }

  async restore(id: string) {
    await delay(40);
    const task = this.find(id);
    task.archived = false;
    task.status = "ready";
    return this.touch(task, "restored", "Task restored");
  }

  async duplicate(id: string) {
    await delay(80);
    const source = this.find(id);
    const copy = clone(source);
    copy.id = uid("tsk");
    copy.title = `${source.title} (copy)`;
    copy.status = "draft";
    copy.progress = 0;
    delete copy.completedAt;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    this.tasks = [copy, ...this.tasks];
    return clone(copy);
  }

  async assign(id: string, assigneeName: string) {
    await delay(40);
    const task = this.find(id);
    task.assigneeName = assigneeName;
    task.status = task.status === "completed" ? task.status : "delegated";
    return this.touch(task, "assigned", `Assigned to ${assigneeName}`);
  }

  async setProgress(id: string, progress: number) {
    await delay(30);
    const task = this.find(id);
    task.progress = Math.max(0, Math.min(100, Math.round(progress)));
    return this.touch(task, "progress_updated", `Progress set to ${task.progress}%`);
  }

  async setPinned(id: string, pinned: boolean) {
    await delay(30);
    const task = this.find(id);
    task.pinned = pinned;
    return this.touch(task, pinned ? "pinned" : "unpinned", pinned ? "Pinned" : "Unpinned");
  }

  async setFavorite(id: string, favorite: boolean) {
    await delay(30);
    const task = this.find(id);
    task.favorite = favorite;
    return this.touch(task, "favorite", favorite ? "Added to favorites" : "Removed from favorites");
  }

  async addSubtask(id: string, title: string) {
    await delay(40);
    const task = this.find(id);
    task.subtasks.push({ id: uid("sub"), title, completed: false, position: task.subtasks.length });
    task.subtaskCount = task.subtasks.length;
    return this.touch(task, "subtask_added", `Subtask added: ${title}`);
  }

  async toggleSubtask(id: string, subtaskId: string) {
    await delay(20);
    const task = this.find(id);
    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (sub) sub.completed = !sub.completed;
    task.subtaskCompletedCount = task.subtasks.filter((s) => s.completed).length;
    return this.touch(task, "subtask_toggled", `${sub?.title ?? "Subtask"} updated`);
  }

  async toggleChecklistItem(id: string, itemId: string) {
    await delay(20);
    const task = this.find(id);
    const item = task.checklist.find((i) => i.id === itemId);
    if (item) item.completed = !item.completed;
    return this.touch(task, "checklist_toggled", `${item?.title ?? "Item"} updated`);
  }

  async addComment(id: string, body: string) {
    await delay(60);
    const task = this.find(id);
    task.comments = [
      { id: uid("cmt"), body, authorName: "Pavan", createdAt: new Date().toISOString() },
      ...task.comments,
    ];
    task.commentCount = task.comments.length;
    return this.touch(task, "commented", "Comment added");
  }
}

/* ---------------- live task service (not wired yet) ---------------- */

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

/* ---------------- mock checklist service ---------------- */

const recount = (instance: ChecklistInstanceDetail) => {
  instance.itemCount = instance.items.length;
  instance.completedCount = instance.items.filter((i) => i.completed).length;
  instance.requiredCount = instance.items.filter((i) => i.required).length;
  instance.requiredCompletedCount = instance.items.filter((i) => i.required && i.completed).length;
  return instance;
};

class MockChecklistService implements ChecklistService {
  private templates: ChecklistTemplateDetail[] = clone(seedTemplates);
  private instances: ChecklistInstanceDetail[] = clone(seedInstances);

  private findTemplate(id: string) {
    const t = this.templates.find((x) => x.id === id);
    if (!t) throw new Error(`Template ${id} not found`);
    return t;
  }
  private findInstance(id: string) {
    const i = this.instances.find((x) => x.id === id);
    if (!i) throw new Error(`Instance ${id} not found`);
    return i;
  }
  private syncTemplate(t: ChecklistTemplateDetail) {
    t.itemCount = t.items.length;
    t.requiredItemCount = t.items.filter((i) => i.required).length;
    t.updatedAt = new Date().toISOString();
    return clone(t);
  }
  private log(instance: ChecklistInstanceDetail, action: string, description: string) {
    instance.history = [
      { id: uid("cev"), action, description, createdAt: new Date().toISOString(), actorName: "Pavan" },
      ...instance.history,
    ];
    return clone(recount(instance));
  }

  async listTemplates() {
    await delay(60);
    return clone(this.templates).map(({ items, ...t }) => {
      void items;
      return t;
    });
  }
  async getTemplate(id: string) {
    await delay(40);
    return clone(this.findTemplate(id));
  }
  async createTemplate(input: CreateChecklistTemplateInput) {
    await delay();
    const now = new Date().toISOString();
    const template: ChecklistTemplateDetail = {
      id: uid("ctp"),
      name: input.name,
      category: input.category,
      itemCount: input.items?.length ?? 0,
      requiredItemCount: input.items?.filter((i) => i.required).length ?? 0,
      usageCount: 0,
      favorite: false,
      archived: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
      items: (input.items ?? []).map((i, index) => ({ ...i, id: uid("cti"), position: index })),
      ...(input.description ? { description: input.description } : {}),
      ...(input.estimatedMinutes ? { estimatedMinutes: input.estimatedMinutes } : {}),
    };
    this.templates = [template, ...this.templates];
    return clone(template);
  }
  async updateTemplate(id: string, input: UpdateChecklistTemplateInput) {
    await delay(60);
    const t = this.findTemplate(id);
    const { items, ...rest } = input;
    void items;
    Object.assign(t, rest);
    t.version += 1;
    return this.syncTemplate(t);
  }
  async duplicateTemplate(id: string) {
    await delay(80);
    const copy = clone(this.findTemplate(id));
    copy.id = uid("ctp");
    copy.name = `${copy.name} (copy)`;
    copy.usageCount = 0;
    copy.version = 1;
    delete copy.lastUsedAt;
    copy.items = copy.items.map((i) => ({ ...i, id: uid("cti") }));
    this.templates = [copy, ...this.templates];
    return clone(copy);
  }
  async archiveTemplate(id: string) {
    await delay(40);
    const t = this.findTemplate(id);
    t.archived = true;
    return this.syncTemplate(t);
  }
  async restoreTemplate(id: string) {
    await delay(40);
    const t = this.findTemplate(id);
    t.archived = false;
    return this.syncTemplate(t);
  }
  async saveTemplateItem(
    templateId: string,
    item: Partial<ChecklistTemplateItem> & { title: string },
  ) {
    await delay(40);
    const t = this.findTemplate(templateId);
    const existing = item.id ? t.items.find((i) => i.id === item.id) : undefined;
    if (existing) Object.assign(existing, item);
    else
      t.items.push({
        id: uid("cti"),
        itemType: "standard",
        required: true,
        priority: "normal",
        position: t.items.length,
        ...item,
      });
    return this.syncTemplate(t);
  }
  async removeTemplateItem(templateId: string, itemId: string) {
    await delay(40);
    const t = this.findTemplate(templateId);
    t.items = t.items.filter((i) => i.id !== itemId).map((i, index) => ({ ...i, position: index }));
    return this.syncTemplate(t);
  }
  async reorderTemplateItems(templateId: string, itemIds: string[]) {
    await delay(40);
    const t = this.findTemplate(templateId);
    t.items = itemIds
      .map((id, index) => {
        const item = t.items.find((i) => i.id === id);
        return item ? { ...item, position: index } : null;
      })
      .filter((i): i is ChecklistTemplateItem => Boolean(i));
    return this.syncTemplate(t);
  }

  async listInstances() {
    await delay(60);
    return clone(this.instances).map(({ items, history, ...i }) => {
      void items;
      void history;
      return i;
    });
  }
  async getInstance(id: string) {
    await delay(40);
    return clone(this.findInstance(id));
  }
  async startInstance(input: CreateChecklistInstanceInput) {
    await delay(120);
    const template = this.findTemplate(input.templateId);
    const now = new Date().toISOString();
    const instance: ChecklistInstanceDetail = {
      id: uid("cli"),
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      name: input.name,
      status: "active",
      itemCount: template.items.length,
      completedCount: 0,
      requiredCount: template.items.filter((i) => i.required).length,
      requiredCompletedCount: 0,
      createdAt: now,
      items: template.items.map((i) => ({
        id: uid("cii"),
        templateItemId: i.id,
        title: i.title,
        itemType: i.itemType,
        required: i.required,
        completed: false,
        position: i.position,
        ...(i.notes ? { notes: i.notes } : {}),
        ...(i.category ? { category: i.category } : {}),
        ...(i.quantity ? { quantity: i.quantity } : {}),
        ...(i.unit ? { unit: i.unit } : {}),
        ...(i.assigneeName ? { assigneeName: i.assigneeName } : {}),
      })),
      history: [
        {
          id: uid("cev"),
          action: "started",
          description: `Checklist started from ${template.name} (v${template.version})`,
          createdAt: now,
          actorName: "Pavan",
        },
      ],
      ...(input.destination ? { destination: input.destination } : {}),
      ...(input.startDate ? { startDate: input.startDate } : {}),
      ...(input.endDate ? { endDate: input.endDate } : {}),
    };
    template.usageCount += 1;
    template.lastUsedAt = now;
    this.instances = [instance, ...this.instances];
    return clone(instance);
  }
  async completeInstance(id: string) {
    await delay(60);
    const i = this.findInstance(id);
    i.status = "completed";
    i.completedAt = new Date().toISOString();
    return this.log(i, "completed", "Checklist completed");
  }
  async cancelInstance(id: string) {
    await delay(60);
    const i = this.findInstance(id);
    i.status = "cancelled";
    return this.log(i, "cancelled", "Checklist cancelled");
  }
  async resetInstance(id: string) {
    await delay(60);
    const i = this.findInstance(id);
    i.items = i.items.map((item) => {
      const { completedAt, completedByName, ...rest } = item;
      void completedAt;
      void completedByName;
      return { ...rest, completed: false };
    });
    i.status = "active";
    delete i.completedAt;
    return this.log(i, "reset", "Checklist reset");
  }
  async duplicateInstance(id: string) {
    await delay(80);
    const copy = clone(this.findInstance(id));
    copy.id = uid("cli");
    copy.name = `${copy.name} (copy)`;
    copy.status = "active";
    delete copy.completedAt;
    copy.items = copy.items.map((item) => ({ ...item, id: uid("cii"), completed: false }));
    copy.createdAt = new Date().toISOString();
    copy.history = [
      { id: uid("cev"), action: "started", description: "Duplicated checklist", createdAt: copy.createdAt, actorName: "Pavan" },
    ];
    this.instances = [recount(copy), ...this.instances];
    return clone(copy);
  }
  async toggleItem(id: string, itemId: string) {
    await delay(15);
    const i = this.findInstance(id);
    const item = i.items.find((x) => x.id === itemId);
    if (item) {
      item.completed = !item.completed;
      if (item.completed) {
        item.completedAt = new Date().toISOString();
        item.completedByName = "Pavan";
      } else {
        delete item.completedAt;
        delete item.completedByName;
      }
    }
    return this.log(
      i,
      item?.completed ? "item_completed" : "item_uncompleted",
      `${item?.title ?? "Item"} ${item?.completed ? "checked" : "unchecked"}`,
    );
  }
  async checkAllRequired(id: string) {
    await delay(60);
    const i = this.findInstance(id);
    const now = new Date().toISOString();
    i.items.forEach((item) => {
      if (item.required && !item.completed) {
        item.completed = true;
        item.completedAt = now;
        item.completedByName = "Pavan";
      }
    });
    return this.log(i, "check_all_required", "All required items checked");
  }
  async uncheckAll(id: string) {
    await delay(60);
    const i = this.findInstance(id);
    i.items.forEach((item) => {
      item.completed = false;
      delete item.completedAt;
      delete item.completedByName;
    });
    return this.log(i, "uncheck_all", "All items unchecked");
  }
  async assignItem(id: string, itemId: string, assigneeName: string) {
    await delay(40);
    const i = this.findInstance(id);
    const item = i.items.find((x) => x.id === itemId);
    if (item) item.assigneeName = assigneeName;
    return this.log(i, "item_assigned", `${item?.title ?? "Item"} assigned to ${assigneeName}`);
  }
  async convertItemToTask(id: string, itemId: string) {
    await delay(80);
    const i = this.findInstance(id);
    const item = i.items.find((x) => x.id === itemId);
    if (item && !item.linkedTaskId) item.linkedTaskId = uid("tsk");
    return this.log(i, "item_converted", `${item?.title ?? "Item"} converted to a task`);
  }
  async recommendations() {
    await delay(60);
    return (await this.listTemplates())
      .filter((t) => !t.archived)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);
  }
}

/* ---------------- live checklist service (not wired yet) ---------------- */

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
 * Integration phase: set USE_MOCK to false. Nothing else changes.
 * ------------------------------------------------------------- */

export const USE_MOCK = true;

export const taskService: TaskService = USE_MOCK ? new MockTaskService() : new ApiTaskService();
export const checklistService: ChecklistService = USE_MOCK
  ? new MockChecklistService()
  : new ApiChecklistService();

export { MockTaskService, ApiTaskService, MockChecklistService, ApiChecklistService, buildQuery };
