import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addDays, startOfDay } from "@/features/tasks/lib/task-timeline";
import { cn } from "@/lib/utils";

export function TaskDateNavigator({
  focusDate,
  onChange,
  onJumpToday,
  onJumpWeek,
}: {
  focusDate: Date;
  onChange: (date: Date) => void;
  onJumpToday: () => void;
  onJumpWeek?: () => void;
}) {
  const label = focusDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isToday = startOfDay(focusDate).getTime() === startOfDay().getTime();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-1 rounded-lg border border-hairline/60 p-0.5">
        <button
          type="button"
          aria-label="Previous day"
          onClick={() => onChange(addDays(focusDate, -1))}
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted/60"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="min-w-[132px] px-2 text-center">
          <p className="font-mono text-xs tracking-wide uppercase">{isToday ? "Today" : label}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
        <button
          type="button"
          aria-label="Next day"
          onClick={() => onChange(addDays(focusDate, 1))}
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted/60"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="flex gap-1">
        {(["Today", "Tomorrow", "This week"] as const).map((chip, i) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              if (i === 0) onJumpToday();
              else if (i === 1) onChange(addDays(startOfDay(), 1));
              else if (onJumpWeek) onJumpWeek();
              else onChange(addDays(startOfDay(), 7));
            }}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] transition",
              (i === 0 && isToday) ||
                (i === 1 &&
                  !isToday &&
                  focusDate.toDateString() === addDays(startOfDay(), 1).toDateString())
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TaskQuickCreate({
  dueAt,
  onSubmit,
  pending,
}: {
  dueAt?: string;
  onSubmit: (title: string) => void;
  pending?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("title") as HTMLInputElement;
        const title = input.value.trim();
        if (!title) return;
        onSubmit(title);
        input.value = "";
      }}
      className="flex items-center gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <Plus className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="title"
          placeholder="What needs to be done?"
          className="h-10 w-full rounded-lg border border-hairline bg-surface/50 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="gradient-primary shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70"
      >
        Add
      </button>
      {dueAt ? (
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          Defaults to selected date
        </span>
      ) : null}
    </form>
  );
}

export function TaskSummaryBar({
  today,
  overdue,
  upcoming,
}: {
  today: number;
  overdue: number;
  upcoming: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide uppercase">
      <span className="text-primary">
        {today} <span className="text-muted-foreground">Today</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span className={overdue ? "text-destructive" : "text-muted-foreground"}>
        {overdue} <span className="text-muted-foreground">Overdue</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-foreground/80">
        {upcoming} <span className="text-muted-foreground">Upcoming</span>
      </span>
    </div>
  );
}
