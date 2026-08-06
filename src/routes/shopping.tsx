import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { Card, ListRow, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { Checkbox } from "@/components/ui/checkbox";
import { shopping as seed } from "@/lib/os-data";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Shopping — Personal OS" },
      { name: "description", content: "Shared lists that stay in sync with your household." },
      { property: "og:title", content: "Shopping — Personal OS" },
      { property: "og:description", content: "Shopping lists inside your Personal OS." },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const [items, setItems] = useState(seed);

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Shopping"
        description="One shared list, always current."
        actions={<Pill tone="primary">{items.filter((i) => !i.done).length} open</Pill>}
      />
      <Section delay={80}>
        <Card padded={false} className="p-2">
          {items.map((i) => (
            <ListRow
              key={i.id}
              leading={
                <Checkbox
                  checked={i.done}
                  aria-label={`Mark ${i.name}`}
                  className="size-5 rounded-lg"
                  onCheckedChange={() =>
                    setItems((list) => list.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))
                  }
                />
              }
              title={<span className={i.done ? "text-muted-foreground line-through" : ""}>{i.name}</span>}
              subtitle={i.qty}
              trailing={
                <span className="bg-primary-soft grid size-9 place-items-center rounded-2xl text-primary">
                  <ShoppingBasket className="size-4" />
                </span>
              }
            />
          ))}
        </Card>
      </Section>
    </PageShell>
  );
}
