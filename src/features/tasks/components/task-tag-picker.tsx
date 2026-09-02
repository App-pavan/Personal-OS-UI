import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import {
  colorForKey,
  formatTagDisplayName,
  GENERAL_TAG_ID,
  isGeneralTag,
  normalizeTagId,
  type TaskTag,
} from "@/features/tasks/lib/task-tags";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function TagDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function TaskTagChip({
  tag,
  className,
  onClick,
}: {
  tag: TaskTag;
  className?: string;
  onClick?: () => void;
}) {
  const palette = colorForKey(tag.color);
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium",
        onClick &&
          "transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
        className,
      )}
      style={{
        color: palette.dot,
        backgroundColor: palette.tint,
        border: `1px solid ${palette.dot}33`,
      }}
    >
      <TagDot color={palette.dot} />
      {tag.name}
    </Comp>
  );
}

export function TaskTagPicker({
  tags,
  value,
  onSelect,
  onCreate,
  compact,
  disabled,
  placeholder = "Tag",
}: {
  tags: TaskTag[];
  value: string | null;
  onSelect: (tagId: string) => void;
  onCreate: (name: string) => void;
  compact?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => (value ? tags.find((t) => t.id === value) : null),
    [tags, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags
      .filter((t) => t.id !== GENERAL_TAG_ID)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.id.includes(q));
  }, [tags, query]);

  const trimmed = query.trim();
  const normalized = normalizeTagId(trimmed);
  const canCreate =
    trimmed.length > 0 &&
    !isGeneralTag(normalized) &&
    !tags.some((t) => t.id === normalized);

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate(formatTagDisplayName(trimmed));
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={selected ? `Tag: ${selected.name}` : "Select tag"}
          className={cn(
            "inline-flex items-center gap-1 rounded-md text-[12px] text-[var(--task-text-muted)] transition-colors",
            "hover:text-[var(--task-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
            compact ? "px-1 py-0.5" : "px-2 py-1",
            disabled && "pointer-events-none opacity-50",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {selected ? (
            <TaskTagChip tag={selected} />
          ) : (
            <>
              <Plus className="size-3" strokeWidth={2} />
              <span>{placeholder}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] border-[var(--task-border)] bg-[var(--task-surface)] p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b border-[var(--task-border)] px-3">
            <Search className="mr-2 size-3.5 shrink-0 text-[var(--task-text-muted)]" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search or create tag…"
              className="h-9 border-0 bg-transparent text-sm"
            />
          </div>
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((tag) => {
                const palette = colorForKey(tag.color);
                return (
                  <CommandItem
                    key={tag.id}
                    value={tag.id}
                    onSelect={() => {
                      onSelect(tag.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="gap-2"
                  >
                    <TagDot color={palette.dot} />
                    <span className="flex-1">{tag.name}</span>
                    {value === tag.id ? (
                      <Check className="size-3.5 text-[var(--task-accent)]" />
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {canCreate ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreate} className="gap-2 text-[var(--task-accent)]">
                    <Plus className="size-3.5" />
                    Create &quot;{formatTagDisplayName(trimmed)}&quot;
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
