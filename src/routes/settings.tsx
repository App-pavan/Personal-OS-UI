import { createFileRoute } from "@tanstack/react-router";
import { Bell, Moon, Palette, ShieldCheck, Sun, User } from "lucide-react";
import { Card, ModuleHeader, PageShell, Pill, Section } from "@/components/os/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/os/theme-provider";
import { user } from "@/lib/os-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Personal OS" },
      { name: "description", content: "Account, appearance, security and notification preferences." },
      { property: "og:title", content: "Settings — Personal OS" },
      { property: "og:description", content: "Preferences for your Personal OS." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageShell>
      <ModuleHeader eyebrow="Module" title="Settings" description="Tune your OS to match how you live." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Account" delay={60}>
          <Card className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="gradient-accent grid size-14 place-items-center rounded-3xl text-sm font-semibold text-accent-foreground">
                {user.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Pill tone="primary">{user.plan}</Pill>
            </div>
            <Button variant="outline" className="rounded-2xl border-hairline">
              <User className="size-4" />
              Edit profile
            </Button>
          </Card>
        </Section>

        <Section title="Appearance" delay={100}>
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-primary">
                <Palette className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Light and dark are equally polished.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    theme === t ? "border-primary bg-primary-soft text-primary" : "border-hairline"
                  }`}
                >
                  {t === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {t}
                </button>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="Notifications" delay={140}>
          <Card className="space-y-4">
            {["Daily AI summary", "Bill reminders", "Family updates", "Backup alerts"].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <span className="bg-accent-soft grid size-10 place-items-center rounded-2xl text-accent">
                  <Bell className="size-4" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{n}</p>
                <Switch defaultChecked aria-label={`Toggle ${n}`} />
              </div>
            ))}
          </Card>
        </Section>

        <Section title="Security" delay={180}>
          <Card className="space-y-4">
            {["Two-factor authentication", "Biometric unlock", "Encrypted vault sync"].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="bg-primary-soft grid size-10 place-items-center rounded-2xl text-success">
                  <ShieldCheck className="size-4" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{s}</p>
                <Switch defaultChecked aria-label={`Toggle ${s}`} />
              </div>
            ))}
          </Card>
        </Section>
      </div>
    </PageShell>
  );
}
