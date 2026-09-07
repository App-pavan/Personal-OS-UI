import { Link } from "@tanstack/react-router";
import {
  ListChecks,
  Smartphone,
  StickyNote,
  Wallet,
} from "lucide-react";
import { HudPanel } from "@/components/future";
import { useCan } from "@/features/capabilities/can";
import { PERM } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type ActionButton = {
  key: string;
  label: string;
  icon: typeof ListChecks;
  disabled?: boolean;
  hint?: string;
  onClick?: () => void;
  to?: "/devices";
};

export function QuickActionsCard({
  onAddTask,
  onAddExpense,
}: {
  onAddTask: () => void;
  onAddExpense: () => void;
}) {
  const { can } = useCan();

  const actions: ActionButton[] = [
    {
      key: "task",
      label: "Add task",
      icon: ListChecks,
      onClick: onAddTask,
      disabled: !can(PERM.TASKS_CREATE),
    },
    {
      key: "expense",
      label: "Add expense",
      icon: Wallet,
      onClick: onAddExpense,
      disabled: !can(PERM.EXPENSES_TRANSACTIONS_CREATE),
    },
    {
      key: "note",
      label: "New note",
      icon: StickyNote,
      disabled: true,
      hint: "Coming soon",
    },
    {
      key: "devices",
      label: "View devices",
      icon: Smartphone,
      to: "/devices",
      disabled: !can(PERM.DEVICE_AWARENESS_DEVICES_VIEW),
    },
  ];

  return (
    <HudPanel accent="primary" className="h-full">
      <p className="label-eyebrow">Quick actions</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const disabled = Boolean(action.disabled);

          if (action.to && !disabled) {
            return (
              <Link
                key={action.key}
                to={action.to}
                className="flex flex-col items-start gap-2 rounded-lg border border-hairline/60 bg-surface/20 p-3 text-left transition hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Icon className="size-4 text-primary" />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={action.key}
              type="button"
              disabled={disabled}
              onClick={action.onClick}
              title={action.hint ?? action.label}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border border-hairline/60 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                disabled
                  ? "cursor-not-allowed opacity-45"
                  : "bg-surface/20 hover:border-primary/30 hover:bg-primary/5",
              )}
            >
              <Icon className="size-4 text-primary" />
              <span className="text-xs font-medium">{action.label}</span>
              {action.hint ? (
                <span className="text-[10px] text-muted-foreground">{action.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </HudPanel>
  );
}
