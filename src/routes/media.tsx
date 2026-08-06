import { createFileRoute } from "@tanstack/react-router";
import { Music } from "lucide-react";
import { Card, Meter, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { mediaLibrary, nowPlaying } from "@/lib/os-data";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — Personal OS" },
      { name: "description", content: "Music, shows and photo libraries in one shelf." },
      { property: "og:title", content: "Media — Personal OS" },
      { property: "og:description", content: "Media library inside your Personal OS." },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Media" description="What you're listening to and watching." />

      <Section title="Now playing" delay={60}>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-lg font-semibold">{nowPlaying.title}</p>
          <p className="text-xs text-muted-foreground">
            {nowPlaying.artist} · {nowPlaying.album}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
            <span>{nowPlaying.elapsed}</span>
            <Meter value={nowPlaying.progress} className="flex-1" />
            <span>{nowPlaying.total}</span>
          </div>
        </div>
      </Section>

      <Section title="Library" delay={120}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {mediaLibrary.map((m) => (
            <Card key={m.id} interactive className="space-y-3">
              <span className="bg-accent-soft grid size-10 place-items-center rounded-2xl text-accent">
                <Music className="size-4" />
              </span>
              <p className="truncate text-sm font-semibold">{m.title}</p>
              <p className="truncate text-xs text-muted-foreground">{m.sub}</p>
              <Pill tone="muted">{m.tag}</Pill>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
