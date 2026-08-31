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

export function TaskAppearanceMenu({ trigger }: { trigger: ReactNode }) {
  const { themeId, setThemeId } = useTaskTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={themeId} onValueChange={(v) => setThemeId(v as typeof themeId)}>
          {TASK_THEME_IDS.map((id) => {
            const theme = TASK_THEMES[id];
            return (
              <DropdownMenuRadioItem key={id} value={id} className="gap-3 py-2">
                <span className="flex h-4 w-8 overflow-hidden rounded-sm border border-border/40">
                  {theme.preview.map((color) => (
                    <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span>{theme.name}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
