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
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function TaskAppearanceMenu({ trigger }: { trigger: ReactNode }) {
  const { themeId, setThemeId } = useTaskTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(420px,70vh)] w-64 overflow-y-auto border-[var(--task-border-strong)] bg-[var(--task-surface)] p-1"
      >
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--task-text-secondary)]">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={themeId} onValueChange={(v) => setThemeId(v as typeof themeId)}>
          {TASK_THEME_IDS.map((id) => {
            const t = TASK_THEMES[id];
            const selected = themeId === id;
            return (
              <DropdownMenuRadioItem
                key={id}
                value={id}
                className="gap-3 rounded-md py-2.5 pl-2 pr-8 focus:bg-[var(--task-hover)]"
              >
                <span className="flex h-5 w-10 shrink-0 overflow-hidden rounded border border-[var(--task-border-strong)]">
                  {t.preview.map((color) => (
                    <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className="flex-1 text-[13px] text-[var(--task-text)]">{t.name}</span>
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
