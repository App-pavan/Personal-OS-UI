import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, startOfDay } from "@/features/tasks/lib/task-timeline";
import { taskSegmentItem } from "@/features/tasks/lib/tasks-ui";

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
  const tomorrow = addDays(startOfDay(), 1);
  const isTomorrow = startOfDay(focusDate).getTime() === tomorrow.getTime();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous day"
          onClick={() => onChange(addDays(focusDate, -1))}
          className="grid size-9 place-items-center rounded-lg text-[var(--task-text-muted)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="min-w-[140px] px-2 text-center">
          <p className="text-sm font-semibold text-[var(--task-text)]">
            {isToday ? "Today" : label}
          </p>
          <p className="text-[13px] text-[var(--task-text-muted)]">{label}</p>
        </div>
        <button
          type="button"
          aria-label="Next day"
          onClick={() => onChange(addDays(focusDate, 1))}
          className="grid size-9 place-items-center rounded-lg text-[var(--task-text-muted)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
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
              else if (i === 1) onChange(tomorrow);
              else if (onJumpWeek) onJumpWeek();
              else onChange(addDays(startOfDay(), 7));
            }}
            className={taskSegmentItem(
              (i === 0 && isToday) || (i === 1 && isTomorrow),
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
