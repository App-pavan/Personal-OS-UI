import { createFileRoute } from "@tanstack/react-router";
import { Activity, HardDrive, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
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
import { nasVolumes, storage } from "@/lib/os-data";

export const Route = createFileRoute("/nas")({
  head: () => ({
    meta: [
      { title: "NAS — Personal OS" },
      { name: "description", content: "Storage, volumes and backup health for your home server." },
      { property: "og:title", content: "NAS — Personal OS" },
      { property: "og:description", content: "Home storage monitoring inside your Personal OS." },
    ],
  }),
  component: NasPage,
});

function NasPage() {
  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="NAS"
        description="Your home server at a glance — capacity, health and last backups."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Used" value={`${storage.used}%`} hint={`of ${storage.total} ${storage.unit}`} icon={HardDrive} />
        <StatCard label="Uptime" value="128 days" hint="No restarts" icon={Activity} tone="success" delay={60} />
        <StatCard label="Last backup" value="1h ago" hint="412 GB synced" icon={ShieldCheck} tone="info" delay={120} />
      </div>

      <AIBar
        placeholder="Ask AI about storage…"
        suggestions={["What's using the most space?", "Prune old snapshots"]}
        onAsk={(q) => toast.success("Inspecting volumes…", { description: q })}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Volumes" delay={100}>
          <div className="space-y-3">
            {nasVolumes.map((v) => {
              const pct = Math.round((v.used / v.total) * 100);
              return (
                <Card key={v.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{v.name}</p>
                    <Pill tone={v.health === "Healthy" ? "success" : "warning"}>{v.health}</Pill>
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {v.used} / {v.total} {v.unit} · {pct}%
                  </p>
                  <Meter value={pct} tone={pct > 80 ? "warning" : "primary"} />
                </Card>
              );
            })}
          </div>
        </Section>

        <Section title="Recent syncs" delay={160}>
          <Card padded={false} className="p-2">
            {[
              { id: "s1", title: "Photos → Backups", sub: "412 GB · 1h ago" },
              { id: "s2", title: "Documents → Off-site", sub: "8.2 GB · 6h ago" },
              { id: "s3", title: "Media library scan", sub: "Completed · Yesterday" },
              { id: "s4", title: "Snapshot pruning", sub: "Freed 84 GB · 2 days ago" },
            ].map((s) => (
              <ListRow
                key={s.id}
                leading={
                  <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                    <HardDrive className="size-4" />
                  </span>
                }
                title={s.title}
                subtitle={s.sub}
              />
            ))}
          </Card>
        </Section>
      </div>
    </PageShell>
  );
}
