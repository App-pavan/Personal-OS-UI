import { useState } from "react";
import { Plus } from "lucide-react";
import type { ExpenseMember } from "@/lib/api/expense-types";
import { cn } from "@/lib/utils";
import { GlassButton, GlassInput } from "./glass";

export function MemberSelector({
  members,
  selected,
  onToggle,
  onCreate,
  creating,
}: {
  members: ExpenseMember[];
  selected: string[];
  onToggle: (id: string) => void;
  onCreate?: (name: string) => void;
  creating?: boolean;
}) {
  const active = members.filter((m) => !m.archived);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {active.map((member) => {
          const on = selected.includes(member.id);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onToggle(member.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
                on
                  ? "border-primary/40 bg-primary/15 font-medium text-primary"
                  : "border-hairline/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {member.name}
            </button>
          );
        })}
      </div>
      {onCreate ? (
        <InlineMemberCreate onCreate={onCreate} loading={creating} />
      ) : null}
    </div>
  );
}

function InlineMemberCreate({
  onCreate,
  loading = false,
}: {
  onCreate: (name: string) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  if (!open) {
    return (
      <GlassButton type="button" variant="ghost" className="text-xs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Add member
      </GlassButton>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onCreate(trimmed);
        setName("");
        setOpen(false);
      }}
    >
      <GlassInput
        autoFocus
        placeholder="Member name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <GlassButton type="submit" disabled={loading || !name.trim()}>
        Add
      </GlassButton>
    </form>
  );
}
