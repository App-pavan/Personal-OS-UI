import type { ExpenseCategory } from "@/lib/api/expense-types";
import { cn } from "@/lib/utils";
import { GlassBadge } from "./glass";

export function CategorySelector({
  categories,
  value,
  suggestedId,
  onChange,
}: {
  categories: ExpenseCategory[];
  value?: string;
  suggestedId?: string;
  onChange: (id: string) => void;
}) {
  const active = categories.filter((c) => !c.archived);
  return (
    <div className="flex flex-wrap gap-2">
      {active.map((cat) => {
        const selected = value === cat.id;
        const suggested = !value && suggestedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.98]",
              selected
                ? "border-primary/40 bg-primary/15 font-medium text-primary"
                : "border-hairline/70 bg-background/30 text-muted-foreground hover:border-primary/25 hover:text-foreground",
            )}
          >
            {cat.icon ? <span className="mr-1.5">{cat.icon}</span> : null}
            {cat.name}
            {suggested ? (
              <GlassBadge tone="accent" className="ml-2">
                Suggested
              </GlassBadge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
