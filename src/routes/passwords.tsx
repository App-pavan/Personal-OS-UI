import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AIBar,
  Card,
  ListRow,
  Meter,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { passwords } from "@/lib/os-data";

export const Route = createFileRoute("/passwords")({
  head: () => ({
    meta: [
      { title: "Passwords — Personal OS" },
      { name: "description", content: "A private vault with health scoring for every credential." },
      { property: "og:title", content: "Passwords — Personal OS" },
      { property: "og:description", content: "Password vault inside your Personal OS." },
    ],
  }),
  component: PasswordsPage,
});

function PasswordsPage() {
  const [revealed, setRevealed] = useState<string | null>(null);
  const avg = Math.round(passwords.reduce((s, p) => s + p.strength, 0) / passwords.length);

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Passwords"
        description="Encrypted, scored and quietly watching for weak spots."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Items" value={`${passwords.length}`} hint="In your vault" icon={KeyRound} />
        <StatCard label="Vault health" value={`${avg}%`} hint="Average strength" icon={ShieldCheck} tone="success" delay={60} />
        <StatCard
          label="Weak"
          value={`${passwords.filter((p) => p.strength < 70).length}`}
          hint="Should be rotated"
          icon={ShieldCheck}
          tone="accent"
          delay={120}
        />
      </div>

      <AIBar
        placeholder="Ask AI about your vault…"
        suggestions={["Which passwords are weak?", "Generate a strong passphrase"]}
        onAsk={(q) => toast.success("Auditing your vault…", { description: q })}
      />

      <Section delay={120}>
        <Card padded={false} className="p-2">
          {passwords.map((p) => (
            <ListRow
              key={p.id}
              leading={
                <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                  <KeyRound className="size-4" />
                </span>
              }
              title={p.name}
              subtitle={
                <span className="flex items-center gap-2">
                  <span>{revealed === p.id ? "••••••••••" : p.user}</span>
                  <span className="text-[11px]">updated {p.updated}</span>
                </span>
              }
              trailing={
                <div className="flex items-center gap-3">
                  <div className="hidden w-24 sm:block">
                    <Meter value={p.strength} tone={p.strength < 70 ? "warning" : "success"} />
                  </div>
                  <Pill tone={p.strength < 70 ? "warning" : "success"}>{p.strength}</Pill>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={revealed === p.id ? `Hide ${p.name}` : `Reveal ${p.name}`}
                    className="size-10 rounded-2xl"
                    onClick={() => setRevealed((r) => (r === p.id ? null : p.id))}
                  >
                    {revealed === p.id ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              }
            />
          ))}
        </Card>
      </Section>
    </PageShell>
  );
}
