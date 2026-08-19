import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bell,
  Cloud,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Radio,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/components/os/theme-provider";
import { FutureState } from "@/components/os/state-views";
import { useAuth } from "@/features/auth/auth-context";
import { WealthSettingsRow } from "@/features/wealth/components/wealth-settings-section";
import { API_BASE_URL, API_CONFIGURED, API_ENVIRONMENT } from "@/lib/api/config";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Personal OS" },
      {
        name: "description",
        content:
          "Account, security, appearance, notifications and backend connection status for your Personal OS.",
      },
      { property: "og:title", content: "Settings — Personal OS" },
      { property: "og:description", content: "Preferences and connection diagnostics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon,
  title,
  line,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  line: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{line}</p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  // A cheap authenticated read doubles as a live connection probe.
  const probe = useTasks({ perPage: 1 });

  const connection = useMemo(() => {
    if (probe.isLoading) return { label: "Checking…", tone: "muted" as const };
    if (probe.isSuccess) return { label: "Connected", tone: "ok" as const };
    return { label: "Unreachable", tone: "bad" as const };
  }, [probe.isLoading, probe.isSuccess]);

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="animate-rise">
        <p className="label-eyebrow">Settings</p>
        <h1 className="display-lg mt-3">How your OS behaves.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          One owner account, one system. Anything not yet built by the backend is marked honestly.
        </p>
      </header>

      <section className="animate-rise surface-raised mt-8 p-5" style={{ animationDelay: "80ms" }}>
        <p className="label-eyebrow">Account</p>
        <div className="hairline-list mt-1">
          <Row
            icon={<UserRound className="size-4" />}
            title={user?.name ?? "Owner"}
            line={user?.email ?? "Master account"}
          >
            <button
              onClick={() => void signOut()}
              className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium transition hover:bg-muted/70"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </Row>
          <Row
            icon={<ShieldCheck className="size-4" />}
            title="Security"
            line="Access and refresh tokens are handled by the backend session. Registration is disabled by design."
          />
        </div>
      </section>

      <section className="animate-rise surface-raised mt-6 p-5" style={{ animationDelay: "120ms" }}>
        <p className="label-eyebrow">Appearance</p>
        <div className="hairline-list mt-1">
          <Row
            icon={<Palette className="size-4" />}
            title="Theme"
            line="Dark is the default surface for Personal OS. Light stays available."
          >
            <button
              onClick={toggle}
              className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium transition hover:bg-muted/70"
            >
              {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              {theme === "dark" ? "Switch to light" : "Switch to dark"}
            </button>
          </Row>
          <Row
            icon={<Monitor className="size-4" />}
            title="Density & typography"
            line="Adjustable density and type scale arrive with the preferences API."
          >
            <span className="rounded-md border border-hairline px-2 py-1 text-[10px] font-medium text-muted-foreground">
              Coming soon
            </span>
          </Row>
        </div>
      </section>

      <section className="animate-rise surface-raised mt-6 p-5" style={{ animationDelay: "160ms" }}>
        <p className="label-eyebrow">Connection</p>
        <div className="hairline-list mt-1">
          <Row
            icon={<Cloud className="size-4" />}
            title="Backend"
            line={
              API_CONFIGURED
                ? "Requests go to the configured Personal OS API."
                : "No VITE_API_BASE_URL is configured — requests fall back to the same origin."
            }
          >
            <span
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium",
                connection.tone === "ok" && "bg-primary-soft text-primary",
                connection.tone === "bad" && "bg-destructive/10 text-destructive",
                connection.tone === "muted" && "border border-hairline text-muted-foreground",
              )}
            >
              {connection.label}
            </span>
          </Row>
          <div className="grid gap-3 py-4 sm:grid-cols-3">
            {[
              { label: "API base", value: API_BASE_URL },
              { label: "Environment", value: API_ENVIRONMENT },
              { label: "Signed in as", value: user?.email ?? "—" },
            ].map((d) => (
              <div key={d.label} className="border-l border-hairline pl-3">
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="mt-0.5 truncate text-sm">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-rise surface-raised mt-6 p-5" style={{ animationDelay: "180ms" }}>
        <p className="label-eyebrow">Observability</p>
        <div className="hairline-list mt-1">
          <Row
            icon={<Radio className="size-4" />}
            title="Runtime activity"
            line="Live operational events from the last 15 minutes — syncs, jobs, and background work."
          >
            <Link
              to="/system/activity"
              className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium transition hover:bg-muted/70"
            >
              Open activity
            </Link>
          </Row>
        </div>
      </section>

      <section className="animate-rise surface-raised mt-6 p-5" style={{ animationDelay: "200ms" }}>
        <p className="label-eyebrow">Wealth</p>
        <div className="hairline-list mt-1">
          <WealthSettingsRow />
        </div>
      </section>

      <section className="animate-rise mt-6 space-y-3" style={{ animationDelay: "200ms" }}>
        <FutureState
          title="Notifications"
          line="Push, email and in-app delivery preferences will appear once the notification API is exposed."
        />
        <FutureState
          title="Application preferences"
          line="Default task view, week start and reminder defaults are stored server-side in a later release."
        />
      </section>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="size-3.5" /> No tokens or secrets are ever displayed here.
      </p>
    </div>
  );
}
