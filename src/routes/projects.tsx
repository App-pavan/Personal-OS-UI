import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { toast } from "sonner";
import {
  AIBar,
  Card,
  Meter,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { projects } from "@/lib/os-data";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Personal OS" },
      { name: "description", content: "Track long-running personal projects with quiet clarity." },
      { property: "og:title", content: "Projects — Personal OS" },
      { property: "og:description", content: "Project tracking inside your Personal OS." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const totalTasks = projects.reduce((s, p) => s + p.tasks, 0);
  const doneTasks = projects.reduce((s, p) => s + p.done, 0);

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Projects"
        description="Bigger efforts, broken into progress you can feel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={`${projects.length}`} hint="In progress" icon={FolderKanban} />
        <StatCard label="Tasks" value={`${totalTasks}`} hint="Across projects" icon={FolderKanban} tone="info" delay={60} />
        <StatCard
          label="Completed"
          value={`${Math.round((doneTasks / totalTasks) * 100)}%`}
          hint="Overall progress"
          icon={FolderKanban}
          tone="success"
          delay={120}
        />
      </div>

      <AIBar
        placeholder="Ask AI about your projects…"
        suggestions={["What's blocking Kerala 2026?", "Suggest next steps", "Summarize progress"]}
        onAsk={(q) => toast.success("Reviewing projects…", { description: q })}
      />

      <Section delay={120}>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Card key={p.id} interactive className="animate-rise space-y-4" >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.done} of {p.tasks} tasks · due {p.due}
                  </p>
                </div>
                <Pill tone={i % 2 ? "accent" : "primary"}>{p.tag}</Pill>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold tabular-nums">{p.progress}%</span>
                </div>
                <Meter value={p.progress} tone={p.progress > 70 ? "success" : "primary"} />
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
