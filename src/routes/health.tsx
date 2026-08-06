import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, Droplets, Footprints, Moon } from "lucide-react";
import { toast } from "sonner";
import {
  AIBar,
  Card,
  Meter,
  ModuleHeader,
  PageShell,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { health } from "@/lib/os-data";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Health — Personal OS" },
      { name: "description", content: "Movement, sleep and hydration tracked without noise." },
      { property: "og:title", content: "Health — Personal OS" },
      { property: "og:description", content: "Health rhythms inside your Personal OS." },
    ],
  }),
  component: HealthPage,
});

function HealthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-2xl px-3 py-2 text-xs">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground tabular-nums">
        {Number(payload[0].value).toLocaleString()} steps
      </p>
    </div>
  );
}

function HealthPage() {
  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Health"
        description="A gentle read on how your body is doing this week."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Steps" value={health.steps.toLocaleString()} hint={`Goal ${health.stepGoal.toLocaleString()}`} icon={Footprints} />
        <StatCard label="Sleep" value={health.sleep} hint="Last night" icon={Moon} tone="info" delay={60} />
        <StatCard label="Resting HR" value={`${health.resting} bpm`} hint="7-day average" icon={Activity} tone="success" delay={120} />
        <StatCard label="Water" value={`${health.water} L`} hint={`Goal ${health.waterGoal} L`} icon={Droplets} tone="accent" delay={180} />
      </div>

      <AIBar
        placeholder="Ask AI about your health trends…"
        suggestions={["How did I sleep this week?", "Suggest a recovery day"]}
        onAsk={(q) => toast.success("Reading your trends…", { description: q })}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Steps this week" delay={100} className="lg:col-span-2">
          <Card>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={health.week} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip content={<HealthTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[12, 12, 12, 12]} animationDuration={1100} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Section>

        <Section title="Goals" delay={160}>
          <Card className="space-y-5">
            {[
              { name: "Steps", value: (health.steps / health.stepGoal) * 100 },
              { name: "Hydration", value: (health.water / health.waterGoal) * 100 },
              { name: "Sleep", value: 88 },
              { name: "Mindfulness", value: 42 },
            ].map((g) => (
              <div key={g.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-muted-foreground tabular-nums">{Math.round(g.value)}%</span>
                </div>
                <Meter value={g.value} tone={g.value > 80 ? "success" : "primary"} />
              </div>
            ))}
          </Card>
        </Section>
      </div>
    </PageShell>
  );
}
