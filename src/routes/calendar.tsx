import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import {
  AIBar,
  Card,
  ListRow,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { events, weekAgenda } from "@/lib/os-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Personal OS" },
      { name: "description", content: "Your week, laid out with room to breathe." },
      { property: "og:title", content: "Calendar — Personal OS" },
      { property: "og:description", content: "Elegant scheduling inside your Personal OS." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Calendar"
        description="Today in focus, the week in context."
        actions={
          <Button
            className="gradient-primary rounded-2xl text-primary-foreground"
            onClick={() => toast.success("New event drafted")}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New event</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={`${events.length}`} hint="Events scheduled" icon={CalendarDays} />
        <StatCard label="This week" value="14" hint="Across all modules" icon={CalendarDays} tone="info" delay={60} />
        <StatCard label="Free blocks" value="5" hint="Over 90 minutes" icon={CalendarDays} tone="success" delay={120} />
      </div>

      <AIBar
        placeholder="Ask AI to reschedule or find time…"
        suggestions={["Find 2 free hours this week", "Move my standup", "Summarize tomorrow"]}
        onAsk={(q) => toast.success("Checking your calendar…", { description: q })}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Today" delay={100}>
          <Card padded={false} className="p-2">
            {events.map((e) => (
              <ListRow
                key={e.id}
                leading={<span className="gradient-primary block h-10 w-1 rounded-full" />}
                title={e.title}
                subtitle={e.time}
                trailing={<Pill tone="muted">{e.tag}</Pill>}
              />
            ))}
          </Card>
        </Section>

        <Section title="This week" delay={160} className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {weekAgenda.map((d) => (
              <Card key={d.day} interactive className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{d.day}</p>
                  <Pill tone="primary">{d.items.length}</Pill>
                </div>
                <div className="space-y-2">
                  {d.items.map((i) => (
                    <p key={i} className="truncate rounded-xl bg-muted/70 px-3 py-2 text-xs">
                      {i}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </PageShell>
  );
}
