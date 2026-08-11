import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ClipboardCheck, Flag, ListChecks, Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BlockEditor } from "./block-editor";
import {
  block,
  docIsEmpty,
  emptyDoc,
  taskToDoc,
  templateToDoc,
  type EditorDoc,
  type ObjectKind,
  type TaskDraftExtras,
} from "@/lib/editor/document";
import {
  createChecklistTemplateFromDoc,
  createTaskFromDoc,
  saveChecklistTemplateFromDoc,
  saveTaskFromDoc,
} from "@/lib/editor/persist";
import { useChecklistTemplate } from "@/hooks/use-checklists";
import { useTask } from "@/hooks/use-tasks";
import { taskKeys } from "@/hooks/use-tasks";
import { checklistKeys } from "@/hooks/use-checklists";
import { errorMessage } from "@/lib/api/errors";
import { RowsSkeleton } from "@/components/os/state-views";
import type { ChecklistCategory, TaskPriority } from "@/lib/api/types";

/* ---------------------------------------------------------------
 * One creation surface for the whole OS. Tasks, checklists and
 * anything later all open the same document editor.
 * ------------------------------------------------------------- */

type Target =
  | { kind: ObjectKind; mode: "create" }
  | { kind: ObjectKind; mode: "edit"; id: string };

type Ctx = {
  create: (kind: ObjectKind, seedTitle?: string) => void;
  edit: (kind: ObjectKind, id: string) => void;
};

const EditorCtx = createContext<Ctx | null>(null);

export function useUniversalEditor() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useUniversalEditor must be used inside <UniversalEditorProvider>");
  return ctx;
}

const categories: ChecklistCategory[] = [
  "personal",
  "travel",
  "family",
  "home",
  "work",
  "health",
  "shopping",
  "emergency",
  "projects",
];

const priorities: TaskPriority[] = ["low", "normal", "high", "urgent"];

export function UniversalEditorProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      create: (kind, seedTitle) => {
        setSeed(seedTitle ?? "");
        setTarget({ kind, mode: "create" });
      },
      edit: (kind, id) => setTarget({ kind, mode: "edit", id }),
    }),
    [],
  );
  const [seed, setSeed] = useState("");

  return (
    <EditorCtx.Provider value={value}>
      {children}
      <Dialog open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)}>
        {target ? (
          <EditorSurface
            key={`${target.kind}-${target.mode}-${"id" in target ? target.id : "new"}`}
            target={target}
            seed={seed}
            onClose={() => setTarget(null)}
          />
        ) : null}
      </Dialog>
    </EditorCtx.Provider>
  );
}

function EditorSurface({
  target,
  seed,
  onClose,
}: {
  target: Target;
  seed: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const editing = target.mode === "edit" ? target.id : null;

  const template = useChecklistTemplate(target.kind === "checklist" ? editing : null);
  const task = useTask(target.kind === "task" ? editing : null);

  const [doc, setDoc] = useState<EditorDoc>(() =>
    target.kind === "checklist"
      ? { title: seed, blocks: [block("check")] }
      : { ...emptyDoc(seed) },
  );
  const [dirty, setDirty] = useState(false);
  const [category, setCategory] = useState<ChecklistCategory>("personal");
  const [extras, setExtras] = useState<TaskDraftExtras>({});
  const [tagDraft, setTagDraft] = useState("");
  const [hydrated, setHydrated] = useState(!editing);

  /* hydrate from the backend when editing */
  useEffect(() => {
    if (!editing || hydrated) return;
    if (target.kind === "checklist" && template.data) {
      setDoc(templateToDoc(template.data));
      setCategory(template.data.category);
      setHydrated(true);
    }
    if (target.kind === "task" && task.data) {
      setDoc(taskToDoc(task.data));
      setExtras({
        priority: task.data.priority,
        ...(task.data.dueAt ? { dueAt: task.data.dueAt } : {}),
        ...(task.data.tags.length ? { tags: task.data.tags } : {}),
      });
      setHydrated(true);
    }
  }, [editing, hydrated, target.kind, template.data, task.data]);

  const change = (next: EditorDoc) => {
    setDoc(next);
    setDirty(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (target.kind === "checklist") {
        if (template.data) return saveChecklistTemplateFromDoc(template.data, doc, category);
        return createChecklistTemplateFromDoc(doc, category);
      }
      if (task.data) return saveTaskFromDoc(task.data, doc, extras);
      return createTaskFromDoc(doc, extras);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: taskKeys.all });
      void qc.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success(
        target.kind === "checklist"
          ? editing
            ? "Checklist updated"
            : "Checklist created"
          : editing
            ? "Task updated"
            : "Task created",
        { description: doc.title.trim() || undefined },
      );
      onClose();
    },
    onError: (error) =>
      toast.error(
        errorMessage(
          error,
          target.kind === "checklist" ? "Unable to save this checklist." : "Unable to save this task.",
        ),
      ),
  });

  const requestClose = useCallback(() => {
    if (dirty && !docIsEmpty(doc)) {
      if (!window.confirm("Discard this draft? Your writing will be lost.")) return;
    }
    onClose();
  }, [dirty, doc, onClose]);

  /* Cmd/Ctrl + Enter saves from anywhere in the surface */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!docIsEmpty(doc)) save.mutate();
    }
  };

  const kindLabel = target.kind === "checklist" ? "Checklist" : "Task";
  const KindIcon = target.kind === "checklist" ? ClipboardCheck : ListChecks;
  const loading = Boolean(editing) && !hydrated;

  return (
    <DialogContent
      onKeyDown={onKeyDown}
      onEscapeKeyDown={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onInteractOutside={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="surface-raised [&>button:last-child]:hidden flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-hairline p-0 shadow-float duration-200 sm:h-auto sm:max-h-[88vh] sm:max-w-[780px] sm:rounded-xl lg:max-w-[860px]"
    >
      <DialogTitle className="sr-only">
        {editing ? `Edit ${kindLabel}` : `New ${kindLabel}`}
      </DialogTitle>

      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline px-4 py-2.5 md:px-6">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <KindIcon className="size-3.5 text-primary" />
          <span className="truncate">{editing ? `Editing ${kindLabel.toLowerCase()}` : `New ${kindLabel.toLowerCase()}`}</span>
        </span>
        <button
          onClick={requestClose}
          aria-label="Close editor"
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/70"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-9">
        {loading ? (
          <RowsSkeleton rows={5} />
        ) : (
          <div className="mx-auto w-full max-w-[640px]">
            <BlockEditor
              doc={doc}
              onChange={change}
              titlePlaceholder={target.kind === "checklist" ? "Name this routine" : "What needs doing?"}
            />
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 md:px-6">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/70">
              <span className="text-sm leading-none">+</span> Add property
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 rounded-xl border-hairline p-3">
            {target.kind === "checklist" ? (
              <div>
                <p className="label-eyebrow">Category</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs capitalize",
                        category === c ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted/70",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="label-eyebrow flex items-center gap-1.5">
                    <Flag className="size-3" /> Priority
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {priorities.map((p) => (
                      <button
                        key={p}
                        onClick={() => setExtras((x) => ({ ...x, priority: p }))}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs capitalize",
                          extras.priority === p
                            ? "bg-primary-soft text-primary"
                            : "text-muted-foreground hover:bg-muted/70",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label-eyebrow flex items-center gap-1.5">
                    <CalendarDays className="size-3" /> Due
                  </p>
                  <input
                    type="datetime-local"
                    aria-label="Due date"
                    value={extras.dueAt ? toLocalInput(extras.dueAt) : ""}
                    onChange={(e) =>
                      setExtras((x) => {
                        const { dueAt: _drop, ...rest } = x;
                        return e.target.value
                          ? { ...rest, dueAt: new Date(e.target.value).toISOString() }
                          : rest;
                      })
                    }
                    className="mt-2 h-9 w-full rounded-md border border-hairline bg-transparent px-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div>
                  <p className="label-eyebrow flex items-center gap-1.5">
                    <Tag className="size-3" /> Tags
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const tag = tagDraft.trim();
                      if (!tag) return;
                      setExtras((x) => ({ ...x, tags: [...new Set([...(x.tags ?? []), tag])] }));
                      setTagDraft("");
                    }}
                  >
                    <input
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      placeholder="Add a tag and press Enter"
                      className="mt-2 h-9 w-full rounded-md border border-hairline bg-transparent px-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </form>
                  {extras.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {extras.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setExtras((x) => ({ ...x, tags: (x.tags ?? []).filter((v) => v !== t) }))
                          }
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t} ✕
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {target.kind === "checklist" ? <span className="capitalize">{category}</span> : null}
          {target.kind === "task" && extras.priority ? (
            <span className="capitalize">{extras.priority}</span>
          ) : null}
          {target.kind === "task" && extras.dueAt ? (
            <span>
              {new Date(extras.dueAt).toLocaleString([], {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={requestClose}
            className="rounded-md px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted/70"
          >
            Discard
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending || docIsEmpty(doc)}
            className="gradient-primary flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {editing ? "Save" : "Create"}
          </button>
        </div>
      </footer>
    </DialogContent>
  );
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
