import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb, Pause, Play, SkipBack, SkipForward, Thermometer } from "lucide-react";
import {
  Card,
  Meter,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { nowPlaying, rooms } from "@/lib/os-data";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Personal OS" },
      { name: "description", content: "Rooms, lighting, climate and the music playing right now." },
      { property: "og:title", content: "Home — Personal OS" },
      { property: "og:description", content: "Home automation inside your Personal OS." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [playing, setPlaying] = useState(true);
  const [lights, setLights] = useState<Record<string, boolean>>({ r1: true, r2: false, r3: true, r4: true });

  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Home" description="Ambient control for every room." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Devices" value="18" hint="9 active" icon={Lightbulb} />
        <StatCard label="Indoor" value="24°" hint="Humidity 55%" icon={Thermometer} tone="accent" delay={60} />
        <StatCard label="Scenes" value="6" hint="Evening active" icon={Lightbulb} tone="info" delay={120} />
      </div>

      <Section title="Now playing" delay={100}>
        <div className="glass-panel rounded-3xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{nowPlaying.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {nowPlaying.artist} · {nowPlaying.album}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous track" className="size-11 rounded-2xl">
                <SkipBack className="size-4" />
              </Button>
              <Button
                size="icon"
                aria-label={playing ? "Pause" : "Play"}
                className="gradient-primary size-12 rounded-2xl text-primary-foreground"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next track" className="size-11 rounded-2xl">
                <SkipForward className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
            <span>{nowPlaying.elapsed}</span>
            <Meter value={nowPlaying.progress} className="flex-1" />
            <span>{nowPlaying.total}</span>
          </div>
        </div>
      </Section>

      <Section title="Rooms" delay={160}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {rooms.map((r) => (
            <Card key={r.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.on} of {r.devices} on
                  </p>
                </div>
                <Switch
                  checked={lights[r.id] ?? false}
                  onCheckedChange={(v) => setLights((l) => ({ ...l, [r.id]: v }))}
                  aria-label={`Toggle lights in ${r.name}`}
                />
              </div>
              <Pill tone="primary">{r.temp}°C</Pill>
              <Meter value={(r.on / r.devices) * 100} />
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
