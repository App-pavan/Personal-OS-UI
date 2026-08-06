import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { Card, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { recipes } from "@/lib/os-data";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Recipes — Personal OS" },
      { name: "description", content: "Meals you cook often, ready when you need them." },
      { property: "og:title", content: "Recipes — Personal OS" },
      { property: "og:description", content: "Recipe collection inside your Personal OS." },
    ],
  }),
  component: RecipesPage,
});

function RecipesPage() {
  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Recipes" description="What's cooking this week." />
      <Section delay={80}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recipes.map((r) => (
            <Card key={r.id} interactive className="space-y-3">
              <span className="bg-accent-soft grid size-10 place-items-center rounded-2xl text-accent">
                <UtensilsCrossed className="size-4" />
              </span>
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.time}</p>
              <Pill tone="muted">{r.tag}</Pill>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
