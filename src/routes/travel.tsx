import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { Card, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { trips } from "@/lib/os-data";

export const Route = createFileRoute("/travel")({
  head: () => ({
    meta: [
      { title: "Travel — Personal OS" },
      { name: "description", content: "Trips being planned, booked and dreamt about." },
      { property: "og:title", content: "Travel — Personal OS" },
      { property: "og:description", content: "Travel planning inside your Personal OS." },
    ],
  }),
  component: TravelPage,
});

function TravelPage() {
  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Travel" description="Where you're headed next." />
      <Section delay={80}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => (
            <Card key={t.id} interactive className="space-y-3">
              <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                <Plane className="size-4" />
              </span>
              <p className="truncate text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.dates}</p>
              <Pill tone={t.status === "Booked" ? "success" : t.status === "Planning" ? "primary" : "muted"}>
                {t.status}
              </Pill>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
