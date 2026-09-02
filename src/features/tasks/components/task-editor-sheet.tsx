import type { CSSProperties, ReactNode } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { useTaskTheme } from "@/features/tasks/lib/task-theme-context";
import { themeToCssVars } from "@/features/tasks/lib/task-theme";
import { cn } from "@/lib/utils";

/** Solid, theme-aware task editor drawer — portals with full task CSS variables applied. */
export function TaskEditorSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const { theme } = useTaskTheme();
  const cssVars = themeToCssVars(theme) as CSSProperties;

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay
          style={cssVars}
          className={cn(
            "fixed inset-0 z-[100] bg-[var(--task-panel-overlay)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "duration-200",
          )}
        />
        <SheetPrimitive.Content
          style={cssVars}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className={cn(
            "fixed inset-y-0 right-0 z-[101] flex h-full w-full flex-col",
            "border-l border-[var(--task-panel-border)] bg-[var(--task-panel-bg)]",
            "text-[var(--task-text)] shadow-[var(--task-panel-shadow)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200 sm:w-[460px] sm:max-w-[calc(100vw-1rem)]",
          )}
          aria-describedby={undefined}
        >
          <div className="flex h-full min-h-0 flex-col bg-[var(--task-panel-bg)]">{children}</div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
