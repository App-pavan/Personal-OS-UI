import { InsightPanel } from "@/components/future";
import { dashboardQuote } from "../lib/dashboard-demo-data";
import { formatDashboardDate, formatWeekLabel, timeGreeting } from "../lib/greetings";

export function CommandCenterHeader({ userName }: { userName?: string | null }) {
  const now = new Date();
  const greeting = timeGreeting(now);
  const nameSuffix = userName ? `, ${userName}` : "";

  return (
    <header className="animate-hud-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium tracking-[0.22em] text-primary/80 uppercase">
            Personal OS
          </p>
          <p className="mt-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Command center
          </p>
          <h1 className="display-lg mt-2 truncate">
            {greeting}
            {nameSuffix}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{dashboardQuote(now)}</p>
          <hr className="tech-divider mt-4 max-w-lg border-0" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:max-w-md lg:flex-col">
          <InsightPanel signal="Daily note" kind="ai" className="flex-1">
            &ldquo;{dashboardQuote(now)}&rdquo;
          </InsightPanel>
          <div className="hud-panel angular-clip shrink-0 px-4 py-3 text-right card-accent-top">
            <p className="text-sm font-medium">{formatDashboardDate(now)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatWeekLabel(now)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
