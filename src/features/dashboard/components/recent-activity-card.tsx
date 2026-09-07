import { Link } from "@tanstack/react-router";
import { DataPanel } from "@/components/future";
import { EmptyState } from "@/components/os/state-views";
import { navAccentStyle } from "@/lib/design/semantic";
import { cn } from "@/lib/utils";
import type { DashboardActivityItem } from "../lib/build-activity-feed";
import { DashboardWidget } from "./dashboard-widget";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function RecentActivityCard({
  items,
  loading,
}: {
  items: DashboardActivityItem[];
  loading?: boolean;
}) {
  if (loading) {
    return <DashboardWidget loading skeletonRows={4} />;
  }

  return (
    <DataPanel title="Recent activity" accent="secondary" className="h-full">
      {items.length === 0 ? (
        <EmptyState
          title="No recent activity"
          line="Activity from tasks and expenses will appear here."
          tone="secondary"
        />
      ) : (
        <ul className="divide-y divide-hairline/40 px-2 md:px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const tone = item.tone ?? "primary";
            const content = (
              <>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center angular-clip-sm border tone-primary-border tone-primary-bg",
                  )}
                  style={navAccentStyle(tone)}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{item.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(item.timestamp)}</p>
                </div>
              </>
            );

            if (item.to) {
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    {...(item.search ? { search: item.search } : {})}
                    className="flex items-start gap-3 py-3 transition hover:bg-primary/5"
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id} className="flex items-start gap-3 py-3">
                {content}
              </li>
            );
          })}
        </ul>
      )}
    </DataPanel>
  );
}
