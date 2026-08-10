import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Clock, History, Link2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/os/primitives";
import { intents as actions, useOS, type Intent, type Priority } from "@/lib/os-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Intents — Personal OS" },
      {
        name: "description",
        content:
          "Intent management: every commitment connected to projects, people, documents, money and place.",
      },
      { property: "og:title", content: "Intents — Personal OS" },
      { property: "og:description", content: "Tasks as objects, not a checklist." },
    ],
  }),
  component: IntentsPage,
});

const windows: { key: Intent["window"] | "all"; label: string; line: string }[] = [
  { key: "now", label: "Now", line: "Hard deadlines inside the next few hours." },
  { key: "today", label: "Today", line: "Everything you intend to close before sleeping." },
  { key: "soon", label: "This week", line: "Shapes the week without pressing on today." },
  { key: "someday", label: "Someday", line: "Held, not forgotten." },
  { key: "all", label: "Everything", line: "Every open intent across your life." },
];

const priorityTone: Record<Priority, "danger" | "warning" | "muted"> = {
  urgent: "danger",
  normal: "warning",
  low: "muted",
};

function IntentsPage() {
  const os = useOS();
  const [win, setWin] = useState<Intent["window"] | "all">("today");
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(os.intents[0]?.id ?? null);
  const [subDraft, setSubDraft] = useState("");

  const list = useMemo(
    () => os.intents.filter((i) => (win === "all" ? true : i.window === win)),
    [os.intents, win],
  );
  const selected = os.intents.find((i) => i.id === openId) ?? null;
  const activeWindow = windows.find((w) => w.key === win)!;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const id = actions.add(draft.trim(), { window: win === "all" ? "today" : (win ?? "today") });
    setDraft("");
    setOpenId(id);
    toast.success("Intent captured");
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="animate-rise max-w-2xl">
        <p className="label-eyebrow">Intents</p>
        <h1 className="display-lg mt-3">
          {list.filter((i) => !i.done).length
            ? `${list.filter((i) => !i.done).length} things want you in this window.`
            : "This window is clear."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeWindow.line}</p>
      </header>

      <div
        className="animate-rise glass-panel mt-6 inline-flex flex-wrap items-center gap-1 rounded-xl p-1"
        style={{ animationDelay: "80ms" }}
      >
        {windows.map((w) => (
          <button
            key={w.label}
            onClick={() => setWin(w.key)}
            className={cn(
              "rail-item rounded-lg px-3 py-1.5 text-sm",
              win === w.key
                ? "gradient-primary font-semibold text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted/70",
            )}
          >
            {w.label}
          </button>
        ))}
      </div>


      <form onSubmit={add} className="animate-rise mt-5 flex items-center gap-2" style={{ animationDelay: "120ms" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write an intent the way you'd say it out loud…"
          className="h-11 min-w-0 flex-1 rounded-lg border border-hairline bg-surface/60 px-3.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="submit"
          aria-label="Add intent"
          className="gradient-primary grid size-11 shrink-0 place-items-center rounded-lg text-primary-foreground transition active:scale-95"
        >
          <Plus className="size-4" />
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <section className="animate-rise" style={{ animationDelay: "160ms" }}>
          <div className="hairline-list border-t border-hairline">
            {list.map((i) => (
              <button
                key={i.id}
                onClick={() => setOpenId(i.id)}
                className={cn(
                  "row-quiet flex w-full items-start gap-3 py-3.5 text-left",
                  openId === i.id && "bg-muted/60",
                )}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.toggle(i.id);
                  }}
                  role="checkbox"
                  aria-checked={i.done}
                  aria-label={`Complete ${i.title}`}
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
                    i.done
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-input text-transparent hover:border-primary hover:text-primary",
                  )}
                >
                  <Check className="size-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm", i.done && "text-muted-foreground line-through")}>
                      {i.title}
                    </span>
                    <Pill tone={priorityTone[i.priority]}>{i.priority}</Pill>
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{i.space}</span>
                    <span>·</span>
                    <span>{i.when}</span>
                    {i.subtasks.length ? (
                      <>
                        <span>·</span>
                        <span>
                          {i.subtasks.filter((s) => s.done).length}/{i.subtasks.length} steps
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
            {!list.length ? (
              <p className="py-10 text-sm text-muted-foreground">
                Nothing lives in this window. That is allowed.
              </p>
            ) : null}
          </div>
        </section>

        {/* Intent as an object — relationships, steps, history, AI reading */}
        {selected ? (
          <aside
            key={selected.id}
            className="animate-rise surface-card sticky top-24 h-fit p-5"
            style={{ animationDelay: "60ms" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label-eyebrow">{selected.space}</p>
                <h2 className="mt-2 text-lg leading-snug font-medium">{selected.title}</h2>
              </div>
              <button
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted/70"
              >
                <X className="size-4" />
              </button>
            </div>

            {selected.detail ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {selected.when}
              </span>
              {(["urgent", "normal", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => actions.setPriority(selected.id, p)}
                  className={cn(
                    "rounded-md px-1.5 py-0.5",
                    selected.priority === p
                      ? "bg-primary-soft text-primary"
                      : "hover:bg-muted/70",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {selected.aiNote ? (
              <p className="mt-4 flex gap-2.5 border-l border-primary/40 pl-3 text-sm leading-relaxed">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="text-foreground/85">{selected.aiNote}</span>
              </p>
            ) : null}

            <div className="mt-5">
              <p className="label-eyebrow">Steps</p>
              <div className="mt-2 space-y-1">
                {selected.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => actions.toggleSub(selected.id, s.id)}
                    className="row-quiet flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left"
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded border",
                        s.done
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-input text-transparent",
                      )}
                    >
                      <Check className="size-2.5" />
                    </span>
                    <span className={cn("text-sm", s.done && "text-muted-foreground line-through")}>
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!subDraft.trim()) return;
                  actions.addSub(selected.id, subDraft.trim());
                  setSubDraft("");
                }}
                className="mt-2"
              >
                <input
                  value={subDraft}
                  onChange={(e) => setSubDraft(e.target.value)}
                  placeholder="Add a step…"
                  className="h-9 w-full rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </form>
            </div>

            {selected.links.length ? (
              <div className="mt-5">
                <p className="label-eyebrow">Related</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.links.map((l) => (
                    <span
                      key={l.label}
                      className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-xs text-muted-foreground"
                    >
                      <Link2 className="size-3" />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.history.length ? (
              <div className="mt-5">
                <p className="label-eyebrow">History</p>
                <div className="mt-2 space-y-2">
                  {selected.history.map((h) => (
                    <p key={h.what} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                      <History className="mt-0.5 size-3 shrink-0" />
                      <span>
                        <span className="text-foreground/80">{h.when}</span> — {h.what}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
