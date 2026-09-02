import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TASK_THEME_IDS, TASK_THEMES } from "@/features/tasks/lib/task-theme";
import { useTaskTheme } from "@/features/tasks/lib/task-theme-context";
import { taskIconBtn } from "@/features/tasks/lib/tasks-ui";
import { Check, Palette } from "lucide-react";

export function TaskAppearanceMenu() {
  const { themeId, setThemeId } = useTaskTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Appearance" className={taskIconBtn}>
              <Palette className="size-[15px]" strokeWidth={1.75} />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Appearance</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="z-[100] max-h-[min(420px,70vh)] w-64 overflow-y-auto border-[var(--task-border-strong)] bg-[var(--task-surface)] p-1 text-[var(--task-text)]"
      >
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--task-text-secondary)]">
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
                <span className="flex h-5 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--task-border-strong)] shadow-[var(--task-shadow-sm)]">
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
