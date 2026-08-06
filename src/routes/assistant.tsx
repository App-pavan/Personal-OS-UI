import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Card, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aiPrompts } from "@/lib/os-data";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Personal OS" },
      { name: "description", content: "A contextual assistant that understands your whole life." },
      { property: "og:title", content: "AI Assistant — Personal OS" },
      { property: "og:description", content: "Ask anything across tasks, finance, documents and family." },
    ],
  }),
  component: AssistantPage,
});

type Message = { id: string; role: "user" | "ai"; text: string };

const canned = {
  default:
    "Here's what I found across your modules: 5 open tasks, ₹4,338 spent this week, and 12 documents waiting to be filed. Want me to draft a plan for today?",
  expenses:
    "You spent ₹4,338 this week — mostly Shopping (₹1,999) and Bills (₹1,250). That's ₹2,160 less than last week. Food is your fastest-growing category.",
  schedule:
    "Today you have a team standup at 10:00, a doctor appointment at 16:00, and dinner with family at 19:30. Your afternoon is free between 11:00 and 16:00.",
  documents:
    "I found 3 tax-related documents: Tax return 2025.pdf, Home insurance 2026.pdf, and Car service invoice.pdf. Two are unfiled.",
  review:
    "Weekly review draft: You closed 3 tasks, moved Home infrastructure to 72%, and stayed under budget in every category except Subscriptions.",
};

function reply(q: string) {
  const s = q.toLowerCase();
  if (s.includes("expense") || s.includes("spend") || s.includes("save")) return canned.expenses;
  if (s.includes("schedule") || s.includes("today") || s.includes("calendar")) return canned.schedule;
  if (s.includes("document") || s.includes("tax") || s.includes("file")) return canned.documents;
  if (s.includes("review") || s.includes("note")) return canned.review;
  return canned.default;
}

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "ai",
      text: "Hi Pavan 👋 How can I help you today? I can see your tasks, calendar, finances, documents and family activity.",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = (text: string) => {
    if (!text.trim()) return;
    const q = text.trim();
    setValue("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: q }]);
    setThinking(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "ai", text: reply(q) }]);
      setThinking(false);
    }, 900);
  };

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="AI Assistant"
        description="Contextual intelligence that lives inside every module — not hidden in a menu."
        actions={<Pill tone="primary">Context: all modules</Pill>}
      />

      <Section delay={80}>
        <Card padded={false} className="flex min-h-[60vh] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("animate-rise flex gap-3", m.role === "user" && "flex-row-reverse")}
              >
                {m.role === "ai" ? (
                  <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-2xl text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>
                ) : (
                  <span className="gradient-accent grid size-9 shrink-0 place-items-center rounded-2xl text-xs font-semibold text-accent-foreground">
                    PV
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "ai"
                      ? "bg-muted/70 text-foreground"
                      : "gradient-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking ? (
              <div className="flex items-center gap-3">
                <span className="gradient-primary grid size-9 place-items-center rounded-2xl text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div className="flex gap-1.5 rounded-3xl bg-muted/70 px-4 py-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="animate-shimmer size-2 rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${i * 160}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-hairline p-4 md:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {aiPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(value);
              }}
            >
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask anything…"
                className="h-12 rounded-2xl bg-muted/60 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                className="gradient-primary size-12 shrink-0 rounded-2xl text-primary-foreground"
              >
                <ArrowUpRight className="size-5" />
              </Button>
            </form>
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
