import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { toast } from "sonner";
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
import { familyMembers, familyUpdates, shopping } from "@/lib/os-data";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family — Personal OS" },
      { name: "description", content: "Shared lists, calendars and updates for the whole household." },
      { property: "og:title", content: "Family — Personal OS" },
      { property: "og:description", content: "The family ecosystem inside your Personal OS." },
    ],
  }),
  component: FamilyPage,
});

function FamilyPage() {
  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Family"
        description="Everyone's day, shared lists and quiet updates in one place."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={`${familyMembers.length}`} hint="In your circle" icon={Users} />
        <StatCard label="Shared items" value="27" hint="Lists and files" icon={Users} tone="accent" delay={60} />
        <StatCard label="Updates" value={`${familyUpdates.length}`} hint="Today" icon={Users} tone="info" delay={120} />
      </div>

      <AIBar
        placeholder="Ask AI about your family's week…"
        suggestions={["What's on the shared list?", "Plan the weekend"]}
        onAsk={(q) => toast.success("Checking shared data…", { description: q })}
      />

      <Section title="Members" delay={100}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {familyMembers.map((m, i) => (
            <Card key={m.id} interactive className="space-y-3 text-center">
              <span
                className={`mx-auto grid size-14 place-items-center rounded-3xl text-sm font-semibold ${
                  i % 2 ? "gradient-accent text-accent-foreground" : "gradient-primary text-primary-foreground"
                }`}
              >
                {m.initials}
              </span>
              <div>
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <Pill tone="muted">{m.status}</Pill>
            </Card>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Updates" delay={160}>
          <Card padded={false} className="p-2">
            {familyUpdates.map((u) => (
              <ListRow
                key={u.id}
                leading={
                  <span className="bg-accent-soft grid size-10 place-items-center rounded-2xl text-accent">
                    <Users className="size-4" />
                  </span>
                }
                title={u.what}
                subtitle={`${u.who} · ${u.when}`}
              />
            ))}
          </Card>
        </Section>

        <Section title="Shared shopping list" delay={200}>
          <Card padded={false} className="p-2">
            {shopping.map((s) => (
              <ListRow
                key={s.id}
                title={<span className={s.done ? "text-muted-foreground line-through" : ""}>{s.name}</span>}
                subtitle={s.qty}
                trailing={<Pill tone={s.done ? "success" : "muted"}>{s.done ? "Done" : "Open"}</Pill>}
              />
            ))}
          </Card>
        </Section>
      </div>
    </PageShell>
  );
}
