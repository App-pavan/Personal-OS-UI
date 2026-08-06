import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CloudRain,
  FileText,
  HardDrive,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AIBar,
  Card,
  ListRow,
  Meter,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  activity,
  aiPrompts,
  aiSuggestions,
  documents,
  events,
  familyUpdates,
  modules,
  nasVolumes,
  notes,
  projects,
  storage,
  tasks as seedTasks,
  transactions,
  user,
  weather,
} from "@/lib/os-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Personal OS" },
      {
        name: "description",
        content:
          "One calm dashboard for today's tasks, schedule, finances, documents, family and storage.",
      },
      { property: "og:title", content: "Dashboard — Personal OS" },
      {
        property: "og:description",
        content: "A unified, premium workspace for every part of your personal life.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tasks, setTasks] = useState(seedTasks);
  const open = tasks.filter((t) => !t.done);

  const toggle = (id: string) =>
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const spentThisWeek = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Good morning"
        title={`Hello, ${user.name}`}
        description="Here's everything happening in your world today — calm, in one place."
        actions={
          <Button variant="outline" className="rounded-2xl border-hairline">
            Customize
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks" value={`${open.length}`} hint="Pending today" icon={ListChecks} delay={0} />
        <StatCard label="Events" value={`${events.length}`} hint="On the calendar" icon={CalendarDays} tone="info" delay={60} />
        <StatCard
          label="Spend"
          value={`₹${spentThisWeek.toLocaleString("en-IN")}`}
          hint="This week"
          icon={Banknote}
          tone="accent"
          delay={120}
        />
        <StatCard label="Storage" value={`${storage.used}%`} hint={`of ${storage.total} ${storage.unit}`} icon={HardDrive} tone="success" delay={180} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section className="lg:col-span-2" delay={80}>
          <div className="surface-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-2xl text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">AI summary</p>
                  <p className="text-xs text-muted-foreground">Generated a moment ago</p>
                </div>
              </div>
              <Pill tone="primary">Live</Pill>
            </div>
            <p className="mt-4 text-base leading-relaxed md:text-lg">
              You have <strong>{open.length} open tasks</strong>, two of them due today. Your week's
              spending is <strong>₹2,160 lower</strong> than last week, and one bill is due in three
              days. Backups volume is nearly full — worth pruning old snapshots.
            </p>
            <div className="mt-5">
              <AIBar
                placeholder="Ask AI about your day…"
                suggestions={aiPrompts}
                onAsk={(q) => toast.success("AI is thinking…", { description: q })}
              />
            </div>
          </div>
        </Section>

        <Section title="Today" delay={140}>
          <Card padded={false} className="overflow-hidden">
            <div className="gradient-primary flex items-center justify-between px-5 py-4 text-primary-foreground">
              <div>
                <p className="text-3xl font-semibold tabular-nums">{weather.temp}°</p>
                <p className="text-xs opacity-90">
                  {weather.condition} · {weather.city}
                </p>
              </div>
              <CloudRain className="size-8 opacity-90" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-hairline text-center">
              {[
                { k: "High", v: `${weather.high}°` },
                { k: "Low", v: `${weather.low}°` },
                { k: "Humidity", v: `${weather.humidity}%` },
              ].map((i) => (
                <div key={i.k} className="px-2 py-3">
                  <p className="text-sm font-semibold tabular-nums">{i.v}</p>
                  <p className="text-[11px] text-muted-foreground">{i.k}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1 p-3">
              {events.slice(0, 3).map((e) => (
                <ListRow
                  key={e.id}
                  leading={<span className="block h-8 w-1 rounded-full gradient-primary" />}
                  title={e.title}
                  subtitle={`${e.time} · ${e.tag}`}
                />
              ))}
            </div>
          </Card>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section
          title="Tasks"
          delay={160}
          action={
            <Link to="/tasks" className="text-xs font-semibold text-primary">
              See all
            </Link>
          }
        >
          <Card padded={false} className="p-2">
            {open.slice(0, 5).map((t) => (
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
                title={t.title}
                subtitle={`${t.module} · ${t.due}`}
                trailing={
                  <Pill tone={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "muted"}>
                    {t.priority}
                  </Pill>
                }
              />
            ))}
          </Card>
        </Section>

        <Section
          title="Recent transactions"
          delay={200}
          action={
            <Link to="/finance" className="text-xs font-semibold text-primary">
              See all
            </Link>
          }
        >
          <Card padded={false} className="p-2">
            {transactions.slice(0, 5).map((t) => (
              <ListRow
                key={t.id}
                leading={
                  <span className="grid size-9 place-items-center rounded-2xl bg-muted text-base">
                    {t.icon}
                  </span>
                }
                title={t.name}
                subtitle={`${t.category} · ${t.when}`}
                trailing={
                  <span
                    className={`text-sm font-semibold tabular-nums ${t.amount > 0 ? "text-success" : ""}`}
                  >
                    {t.amount > 0 ? "+" : "−"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </span>
                }
              />
            ))}
          </Card>
        </Section>

        <Section title="AI suggestions" delay={240}>
          <Card padded={false} className="p-2">
            {aiSuggestions.map((s) => (
              <ListRow
                key={s.id}
                leading={
                  <span className="bg-primary-soft grid size-9 place-items-center rounded-2xl text-primary">
                    <Sparkles className="size-4" />
                  </span>
                }
                title={s.text}
                subtitle={s.action}
                onClick={() => toast.success(s.action, { description: s.text })}
              />
            ))}
          </Card>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Projects" delay={260}>
          <Card className="space-y-4">
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <span className="text-xs text-muted-foreground tabular-nums">{p.progress}%</span>
                </div>
                <Meter value={p.progress} tone={p.progress > 70 ? "success" : "primary"} />
              </div>
            ))}
          </Card>
        </Section>

        <Section title="Recent documents" delay={300}>
          <Card padded={false} className="p-2">
            {documents.slice(0, 4).map((d) => (
              <ListRow
                key={d.id}
                leading={
                  <span className="bg-primary-soft grid size-9 place-items-center rounded-2xl text-primary">
                    <FileText className="size-4" />
                  </span>
                }
                title={d.name}
                subtitle={`${d.size} · ${d.when}`}
              />
            ))}
          </Card>
        </Section>

        <Section title="Family & storage" delay={340}>
          <div className="space-y-4">
            <Card padded={false} className="p-2">
              {familyUpdates.map((f) => (
                <ListRow
                  key={f.id}
                  leading={
                    <span className="bg-accent-soft grid size-9 place-items-center rounded-2xl text-accent">
                      <Users className="size-4" />
                    </span>
                  }
                  title={f.what}
                  subtitle={`${f.who} · ${f.when}`}
                />
              ))}
            </Card>
            <Card className="space-y-3">
              {nasVolumes.map((v) => (
                <div key={v.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{v.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {v.used} / {v.total} {v.unit}
                    </span>
                  </div>
                  <Meter
                    value={(v.used / v.total) * 100}
                    tone={v.used / v.total > 0.8 ? "warning" : "primary"}
                  />
                </div>
              ))}
            </Card>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Quick notes" delay={360}>
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.slice(0, 4).map((n) => (
              <Card key={n.id} interactive className="space-y-2">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {n.excerpt}
                </p>
                <p className="text-[11px] text-muted-foreground">{n.when}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Recent activity" delay={400}>
          <Card padded={false} className="p-2">
            {activity.map((a) => (
              <ListRow
                key={a.id}
                leading={
                  <span className="bg-primary-soft grid size-9 place-items-center rounded-2xl text-success">
                    <CheckCircle2 className="size-4" />
                  </span>
                }
                title={a.what}
                subtitle={`${a.module} · ${a.when}`}
              />
            ))}
          </Card>
        </Section>
      </div>

      <Section title="Pinned modules" delay={440}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {modules.slice(1, 13).map((m) => (
            <Link key={m.to} to={m.to} className="surface-card hover-lift flex flex-col gap-3 p-4">
              <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                <m.icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{m.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{m.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
