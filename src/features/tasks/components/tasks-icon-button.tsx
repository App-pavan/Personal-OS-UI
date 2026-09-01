import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { taskIconBtn } from "@/features/tasks/lib/tasks-ui";
import { cn } from "@/lib/utils";

export function TasksIconButton({
  label,
  onClick,
  children,
  className,
  pressed,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={pressed}
          onClick={onClick}
          className={cn(
            taskIconBtn,
            pressed && "border-[var(--task-accent)]/30 bg-[var(--task-accent-soft)] text-[var(--task-accent)]",
            className,
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
