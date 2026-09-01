import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_THEME_IDS, TASK_THEMES } from "@/features/tasks/lib/task-theme";
import { useTaskTheme } from "@/features/tasks/lib/task-theme-context";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

export function TaskAppearanceMenu({ trigger }: { trigger: ReactNode }) {
  const { themeId, setThemeId } = useTaskTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-[var(--task-border)] bg-[var(--task-surface)] p-1">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--task-text-secondary)]">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={themeId} onValueChange={(v) => setThemeId(v as typeof themeId)}>
          {TASK_THEME_IDS.map((id) => {
            const theme = TASK_THEMES[id];
            const selected = themeId === id;
            return (
              <DropdownMenuRadioItem
                key={id}
                value={id}
                className="gap-3 rounded-md py-2.5 pl-2 pr-8 focus:bg-[var(--task-hover)]"
              >
                <span className="flex h-5 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--task-border-subtle)] shadow-[var(--task-shadow-sm)]">
                  {theme.preview.map((color) => (
                    <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className="flex-1 text-[13px] text-[var(--task-text)]">{theme.name}</span>
                {selected ? (
                  <Check className="size-3.5 text-[var(--task-accent)]" strokeWidth={2} aria-hidden />
                ) : null}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
