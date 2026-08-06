import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ListChecks, Plus } from "lucide-react";
import {
  AIBar,
  Card,
  EmptyState,
  ListRow,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks as seedTasks, type Task } from "@/lib/os-data";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Personal OS" },
      { name: "description", content: "Capture, organize and complete everything on your plate." },
      { property: "og:title", content: "Tasks — Personal OS" },
      { property: "og:description", content: "A calm task module inside your Personal OS." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const visible = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFilter =
        filter === "all" ? true : filter === "open" ? !t.done : filter === "done" ? t.done : t.priority === "high";
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [tasks, filter, query]);

  const toggle = (id: string) =>
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const add = () => {
    if (!draft.trim()) return;
    setTasks((list) => [
      {
        id: `t${Date.now()}`,
        title: draft.trim(),
        module: "Tasks",
        due: "Today",
        priority: "medium",
        done: false,
      },
      ...list,
    ]);
    setDraft("");
    toast.success("Task added");
  };

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Tasks"
        description="Everything you've committed to, grouped by intent rather than by app."
        actions={
          <Button className="gradient-primary rounded-2xl text-primary-foreground" onClick={add}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">New task</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={`${tasks.filter((t) => !t.done).length}`} hint="Across modules" icon={ListChecks} />
        <StatCard
          label="Completed"
          value={`${tasks.filter((t) => t.done).length}`}
          hint="This week"
          icon={CheckCircle2}
          tone="success"
          delay={60}
        />
        <StatCard
          label="High priority"
          value={`${tasks.filter((t) => t.priority === "high" && !t.done).length}`}
          hint="Needs attention"
          icon={ListChecks}
          tone="accent"
          delay={120}
        />
      </div>

      <AIBar
        placeholder="Ask AI to plan, reschedule or summarize your tasks…"
        suggestions={["Plan my day", "What's overdue?", "Group tasks by project"]}
        onAsk={(q) => toast.success("AI is planning…", { description: q })}
      />

      <Section delay={120}>
        <Card className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="h-11 min-w-0 rounded-2xl bg-muted/60 sm:max-w-xs"
            />
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="rounded-2xl">
                <TabsTrigger value="open" className="rounded-xl">
                  Open
                </TabsTrigger>
                <TabsTrigger value="high" className="rounded-xl">
                  Priority
                </TabsTrigger>
                <TabsTrigger value="done" className="rounded-xl">
                  Done
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-xl">
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Add a task and press enter…"
              className="h-11 rounded-2xl bg-muted/60"
            />
            <Button size="icon" aria-label="Add task" className="size-11 rounded-2xl" onClick={add}>
              <Plus className="size-4" />
            </Button>
          </div>

          {visible.length ? (
            <div className="-mx-2">
              {visible.map((t) => (
                <ListRow
                  key={t.id}
                  leading={
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => toggle(t.id)}
                      aria-label={`Complete ${t.title}`}
                      className="size-5 rounded-lg"
                    />
                  }
                  title={<span className={t.done ? "text-muted-foreground line-through" : ""}>{t.title}</span>}
                  subtitle={`${t.module} · ${t.due}${t.project ? ` · ${t.project}` : ""}`}
                  trailing={
                    <Pill
                      tone={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "muted"}
                    >
                      {t.priority}
                    </Pill>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="Nothing here"
              message="No tasks match this view. Add one above or clear your filters to see everything."
              action={
                <Button className="gradient-primary rounded-2xl text-primary-foreground" onClick={() => setFilter("all")}>
                  Show all tasks
                </Button>
              }
              secondary="Tip: ask AI to plan your day for you."
            />
          )}
        </Card>
      </Section>
    </PageShell>
  );
}
