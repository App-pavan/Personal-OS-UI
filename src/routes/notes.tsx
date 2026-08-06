import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import { AIBar, Card, EmptyState, ModuleHeader, PageShell, Section } from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notes as seedNotes } from "@/lib/os-data";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Personal OS" },
      { name: "description", content: "A calm space to think, capture and revisit ideas." },
      { property: "og:title", content: "Notes — Personal OS" },
      { property: "og:description", content: "Notes and thinking space inside your Personal OS." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState(seedNotes);
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    setNotes((n) => [
      { id: `n${Date.now()}`, title: draft.trim(), excerpt: "Empty note — start writing…", when: "Just now" },
      ...n,
    ]);
    setDraft("");
    toast.success("Note created");
  };

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Notes"
        description="Quick captures and long-form thinking, in the same quiet surface."
        actions={
          <Button className="gradient-primary rounded-2xl text-primary-foreground" onClick={add}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">New note</span>
          </Button>
        }
      />

      <AIBar
        placeholder="Ask AI to summarize or expand a note…"
        suggestions={["Draft a weekly review from my notes", "Summarize home server ideas"]}
        onAsk={(q) => toast.success("Working on it…", { description: q })}
      />

      <Section delay={100}>
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Note title…"
              className="h-11 rounded-2xl bg-muted/60"
            />
            <Button size="icon" aria-label="Add note" className="size-11 rounded-2xl" onClick={add}>
              <Plus className="size-4" />
            </Button>
          </div>

          {notes.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {notes.map((n) => (
                <Card key={n.id} interactive className="space-y-2">
                  <p className="truncate text-sm font-semibold">{n.title}</p>
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{n.excerpt}</p>
                  <p className="text-[11px] text-muted-foreground">{n.when}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={NotebookPen}
              title="No notes yet"
              message="Capture a thought and it will live here, searchable from anywhere in your OS."
              action={<Button className="gradient-primary rounded-2xl text-primary-foreground">Create a note</Button>}
              secondary="Try asking AI to draft one for you."
            />
          )}
        </Card>
      </Section>
    </PageShell>
  );
}
