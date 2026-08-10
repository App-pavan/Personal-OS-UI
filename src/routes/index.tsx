import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CloudSun,
  HardDrive,
  Lightbulb,
  ListMusic,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/os/primitives";
import {
  documents,
  events,
  familyUpdates,
  nasVolumes,
  nowPlaying,
  projects,
  rooms,
  storage,
  user,
  weather,
} from "@/lib/os-data";
import { intents as intentActions, docs as docActions, useOS } from "@/lib/os-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Personal OS" },
      {
        name: "description",
        content:
          "An intelligent daily briefing: what needs your attention, what you were working on, and what changed across your life.",
      },
      { property: "og:title", content: "Today — Personal OS" },
      {
        property: "og:description",
        content: "Your personal operating system opens with context, not statistics.",
      },
    ],
  }),
  component: TodayPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

function TileHead({
  label,
  icon: Icon,
  to,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  to?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="label-eyebrow flex items-center gap-2">
        {Icon ? <Icon className="size-3.5 text-primary" /> : null}
        {label}
      </p>
      {to ? (
        <Link
          to={to}
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label={`Open ${label}`}
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function TodayPage() {
  const os = useOS();
  const [capture, setCapture] = useState("");

  const open = os.intents.filter((i) => !i.done);
  const focus = useMemo(
    () => [...open].sort((a, b) => (a.priority === "urgent" ? -1 : 1)).slice(0, 3),
    [open],
  );

  const brief = [
    `Two things carry a real deadline today — the insurance renewal before 6:30 PM, and the NAS keys before you sleep.`,
    `Your passport expires in 8 months, which is early enough to ignore for now.`,
    `You have spent 18% less than last month at this point in the cycle.`,
  ];

  const submitCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const text = capture.trim();
    if (!text) return;
    if (text.endsWith("?") || text.length > 90) {
      docActions.add(text);
      toast.success("Saved as a note");
    } else {
      intentActions.add(text);
      toast.success("Added to today");
    }
    setCapture("");
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Briefing — the interface speaks first */}
      <section className="animate-rise max-w-3xl">
        <p className="label-eyebrow">
          {new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="display-xl mt-3 text-balance">
          {greeting()}, {user.name}.
          <span className="block text-muted-foreground">
            {open.length ? "Two important things before lunch." : "Nothing is asking for you."}
          </span>
        </h1>

        <div className="mt-6 space-y-2.5">
          {brief.map((line, i) => (
            <p
              key={line}
              className="animate-rise flex items-start gap-3 text-[15px] leading-relaxed text-foreground/85"
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <Sparkles className="mt-1 size-3.5 shrink-0 text-primary" />
              <span>{line}</span>
            </p>
          ))}
        </div>

        <form
          onSubmit={submitCapture}
          className="animate-rise mt-6 flex items-center gap-2"
          style={{ animationDelay: "380ms" }}
        >
          <input
            value={capture}
            onChange={(e) => setCapture(e.target.value)}
            placeholder="Say it in plain words — “renew car insurance next week”"
            className="h-11 min-w-0 flex-1 rounded-lg border border-hairline bg-surface/60 px-3.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="submit"
            aria-label="Capture"
            className="gradient-primary grid size-11 shrink-0 place-items-center rounded-lg text-primary-foreground transition active:scale-95"
          >
            <ArrowUpRight className="size-4" />
          </button>
        </form>
      </section>

      {/* Bento surface */}
      <div className="bento-grid animate-rise mt-9" style={{ animationDelay: "240ms" }}>
        {/* Focus — the heaviest tile */}
        <section className="bento-tile tile-glow md:col-span-6 xl:col-span-7 xl:row-span-2">
          <TileHead label="Today's focus" to="/tasks" />
          <div className="hairline-list">
            {focus.map((i) => (
              <div key={i.id} className="row-quiet group flex items-start gap-3 rounded-md py-3">
                <button
                  onClick={() => intentActions.toggle(i.id)}
                  aria-label={`Complete ${i.title}`}
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-input text-transparent transition hover:border-primary hover:text-primary"
                >
                  <Check className="size-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-medium">{i.title}</p>
                    {i.priority === "urgent" ? <Pill tone="danger">now</Pill> : null}
                    <span className="text-xs text-muted-foreground">{i.when}</span>
                  </div>
                  {i.aiNote ? (
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {i.aiNote}
                    </p>
                  ) : null}
                  {i.links.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {i.links.map((l) => (
                        <span
                          key={l.label}
                          className="rounded-md border border-hairline px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {l.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Link
                  to="/tasks"
                  className="mt-1 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                  aria-label="Open intent"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            ))}
            {!focus.length ? (
              <p className="py-8 text-sm text-muted-foreground">
                Nothing is pulling at you right now.
              </p>
            ) : null}
          </div>
        </section>

        {/* Weather — glass, ambient */}
        <section className="glass-panel sheen-top relative col-span-2 overflow-hidden rounded-xl p-4 md:col-span-3 xl:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-4xl leading-none font-medium tabular-nums">{weather.temp}°</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {weather.condition} · {weather.city}
              </p>
            </div>
            <CloudSun className="size-6 text-accent" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Clear until late evening — a good window for the walk you skipped yesterday.
          </p>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span>H {weather.high}°</span>
            <span>L {weather.low}°</span>
            <span>{weather.humidity}% humidity</span>
          </div>
        </section>

        {/* Later today */}
        <section className="bento-tile md:col-span-3 xl:col-span-5">
          <TileHead label="Later today" to="/calendar" />
          <div className="hairline-list">
            {events.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {e.time.split(" – ")[0]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{e.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{e.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Continue working */}
        <section className="bento-tile md:col-span-3 xl:col-span-4">
          <TileHead label="Continue working" to="/notes" />
          <div className="space-y-1">
            {os.docs.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                to="/notes"
                className="row-quiet flex items-center gap-3 rounded-md px-1.5 py-2"
              >
                <span className="text-base text-muted-foreground">{d.glyph}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{d.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {d.collection} · {d.updated}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="bento-tile md:col-span-3 xl:col-span-4">
          <TileHead label="Moving quietly" to="/projects" />
          <div className="space-y-3.5">
            {projects.slice(0, 3).map((p) => (
              <Link key={p.id} to="/projects" className="block">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm">{p.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {p.progress}%
                  </span>
                </div>
                <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="gradient-primary h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Now playing — glass control */}
        <section className="glass-panel col-span-2 overflow-hidden rounded-xl p-4 md:col-span-3 xl:col-span-4">
          <TileHead label="Playing" icon={ListMusic} to="/media" />
          <p className="truncate text-sm font-medium">{nowPlaying.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {nowPlaying.artist} · {nowPlaying.album}
          </p>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="gradient-accent h-full rounded-full"
              style={{ width: `${nowPlaying.progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground tabular-nums">
            <span>{nowPlaying.elapsed}</span>
            <span>{nowPlaying.total}</span>
          </div>
        </section>

        {/* People */}
        <section className="bento-tile md:col-span-3 xl:col-span-4">
          <TileHead label="Your people" icon={Users} to="/family" />
          <div className="space-y-3">
            {familyUpdates.slice(0, 3).map((f) => (
              <p key={f.id} className="text-sm leading-relaxed text-muted-foreground">
                <span className="text-foreground">{f.who}</span> {f.what}
              </p>
            ))}
          </div>
        </section>

        {/* House & storage */}
        <section className="bento-tile md:col-span-3 xl:col-span-4">
          <TileHead label="House & storage" to="/nas" />
          <div className="space-y-3 text-sm">
            <p className="flex gap-2.5 leading-relaxed">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-accent" />
              <span className="text-muted-foreground">
                {rooms.filter((r) => r.on > 0).length} rooms are awake. Evening scene starts in an
                hour.
              </span>
            </p>
            <p className="flex gap-2.5 leading-relaxed">
              <HardDrive className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                Backups finished at 03:12. {nasVolumes[0]?.name} is the only volume worth watching.
              </span>
            </p>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${storage.used}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {storage.used}% of {storage.total} {storage.unit} used
            </p>
          </div>
        </section>

        {/* Money */}
        <section className="bento-tile md:col-span-3 xl:col-span-4">
          <TileHead label="Money" icon={Wallet} to="/finance" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Spending is calm this cycle — ₹32,000 of ₹50,000, and nothing unusual cleared today.
          </p>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div className="gradient-accent h-full rounded-full" style={{ width: "64%" }} />
          </div>
        </section>

        {/* Papers */}
        <section className="bento-tile md:col-span-6 xl:col-span-8">
          <TileHead label="Papers you touched" to="/documents" />
          <div className="grid gap-1 sm:grid-cols-2">
            {documents.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                to="/documents"
                className="row-quiet flex items-center gap-3 rounded-md px-1.5 py-2"
              >
                <span className={cn("min-w-0 flex-1 truncate text-sm")}>{d.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{d.when}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
