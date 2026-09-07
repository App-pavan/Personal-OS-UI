import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { HudPanel } from "@/components/future";
import { Can } from "@/features/capabilities/can";
import { Pill } from "@/components/os/primitives";
import { EmptyState } from "@/components/os/state-views";
import { formatDueLabel } from "@/features/tasks/lib/task-buckets";
import type { TaskSummary } from "@/lib/api/types";
import { PERM } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { DashboardWidget } from "./dashboard-widget";

export function FocusQueueCard({
  tasks,
  loading,
  error,
  onRetry,
  onComplete,
  completing,
}: {
  tasks: TaskSummary[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onComplete: (id: string) => void;
  completing?: boolean;
}) {
  return (
    <DashboardWidget
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Tasks unavailable"
      skeletonRows={4}
      empty={
        !tasks.length ? (
          <HudPanel glow corners className="lg:col-span-7">
            <FocusQueueHeader />
            <EmptyState
              title="No active tasks"
              line="Create your first task when something needs your attention."
            />
          </HudPanel>
        ) : undefined
      }
    >
      <HudPanel glow corners className="h-full">
        <FocusQueueHeader />
        <ul className="mt-3 space-y-1">
          {tasks.map((task) => (
            <li key={task.id}>
              <div className="flex items-start gap-3 rounded-lg border border-transparent px-2 py-2.5 transition hover:border-hairline/60 hover:bg-surface/30">
                <Can permission={PERM.TASKS_UPDATE}>
                  <button
                    type="button"
                    onClick={() => onComplete(task.id)}
                    disabled={completing}
                    aria-label={`Complete ${task.title}`}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center angular-clip-sm border border-primary/40 text-transparent transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
                  >
                    <Check className="size-3" />
                  </button>
                </Can>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/tasks"
                    search={{ taskId: task.id }}
                    className="text-sm font-medium leading-snug hover:text-primary"
                  >
                    {task.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {(task.priority === "urgent" || task.priority === "high") && (
                      <Pill
                        tone={
                          task.priority === "urgent"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {task.priority === "urgent" ? "Urgent" : "High"}
                      </Pill>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDueLabel(task.dueAt) ?? task.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </HudPanel>
    </DashboardWidget>
  );
}

function FocusQueueHeader() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="label-eyebrow">Focus queue</p>
        <p className="text-xs text-muted-foreground">What&apos;s important now</p>
      </div>
      <Link
        to="/tasks"
        className={cn("flex items-center gap-1 text-xs text-primary hover:text-accent")}
      >
        View all tasks <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
