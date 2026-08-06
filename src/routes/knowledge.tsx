import { createFileRoute } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { Card, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { knowledge } from "@/lib/os-data";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — Personal OS" },
      { name: "description", content: "Your saved thinking, organized into living collections." },
      { property: "og:title", content: "Knowledge — Personal OS" },
      { property: "og:description", content: "Knowledge collections inside your Personal OS." },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Knowledge" description="Collections of what you've learned and want to keep." />
      <Section delay={80}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {knowledge.map((k) => (
            <Card key={k.id} interactive className="space-y-3">
              <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                <Library className="size-4" />
              </span>
              <p className="truncate text-sm font-semibold">{k.title}</p>
              <p className="text-xs text-muted-foreground">{k.items} items</p>
              <Pill tone="muted">{k.tag}</Pill>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
