import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AIBar,
  Card,
  EmptyState,
  ListRow,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documents } from "@/lib/os-data";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Personal OS" },
      { name: "description", content: "Every important paper, searchable and safely filed." },
      { property: "og:title", content: "Documents — Personal OS" },
      { property: "og:description", content: "Document management inside your Personal OS." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const [query, setQuery] = useState("");
  const visible = documents.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Documents"
        description="Insurance, taxes, leases and scans — filed and instantly findable."
        actions={
          <Button
            className="gradient-primary rounded-2xl text-primary-foreground"
            onClick={() => toast.success("Upload ready")}
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Documents" value="184" hint="Filed" icon={FileText} />
        <StatCard label="Unfiled" value="12" hint="Needs review" icon={FileText} tone="accent" delay={60} />
        <StatCard label="Shared" value="7" hint="With family" icon={FileText} tone="info" delay={120} />
      </div>

      <AIBar
        placeholder="Ask AI to find or summarize a document…"
        suggestions={["Show documents related to taxes", "Summarize my lease", "Find expiring policies"]}
        onAsk={(q) => toast.success("Searching your archive…", { description: q })}
      />

      <Section delay={120}>
        <Card className="space-y-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="h-11 rounded-2xl bg-muted/60 sm:max-w-sm"
          />
          {visible.length ? (
            <div className="-mx-2">
              {visible.map((d) => (
                <ListRow
                  key={d.id}
                  leading={
                    <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                      <FileText className="size-4" />
                    </span>
                  }
                  title={d.name}
                  subtitle={`${d.size} · ${d.when}`}
                  trailing={<Pill tone="muted">{d.kind}</Pill>}
                  onClick={() => toast.success("Opening document", { description: d.name })}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents found"
              message="Nothing matches that search. Try another term, or upload a new document to your archive."
              action={
                <Button className="gradient-primary rounded-2xl text-primary-foreground" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
              secondary="AI can auto-file new uploads for you."
            />
          )}
        </Card>
      </Section>
    </PageShell>
  );
}
