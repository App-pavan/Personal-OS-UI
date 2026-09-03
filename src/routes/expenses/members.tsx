import { createFileRoute } from "@tanstack/react-router";
import { Archive, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { GlassBadge, GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { useExpenseMonth } from "@/features/expenses/expense-month-context";
import { formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import { enrichMemberAnalytics } from "@/features/expenses/lib/insights-utils";
import { useMemberInsights, useMemberMutations, useMembers } from "@/hooks/use-expenses";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/expenses/members")({
  head: () => ({ meta: [{ title: "Members — Personal OS" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { month } = useExpenseMonth();
  const members = useMembers();
  const memberInsights = useMemberInsights(month);
  const m = useMemberMutations();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const active = (members.data ?? []).filter((x) => !x.archived);
  const archived = (members.data ?? []).filter((x) => x.archived);

  const spentByMember = useMemo(() => {
    const rows = enrichMemberAnalytics(memberInsights.data ?? [], members.data ?? []);
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.memberId, row.amountMinor);
    }
    return map;
  }, [memberInsights.data, members.data]);

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Members"
        description={`People you split expenses with — ${formatMonthLabel(month)}`}
        actions={
          <GlassButton onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Add member
          </GlassButton>
        }
      />

      {creating && (
        <form
          className="glass-panel flex gap-2 rounded-xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            m.create.mutate(
              { name: trimmed },
              {
                onSuccess: () => {
                  setName("");
                  setCreating(false);
                },
              },
            );
          }}
        >
          <GlassInput
            autoFocus
            placeholder="Member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <GlassButton type="submit" disabled={!name.trim() || m.create.isPending}>
            Save
          </GlassButton>
        </form>
      )}

      {members.isError ? (
        <ErrorState error={members.error} onRetry={() => members.refetch()} />
      ) : members.isLoading ? (
        <RowsSkeleton rows={4} />
      ) : active.length === 0 && archived.length === 0 ? (
        <EmptyState
          title="No members yet"
          line="Add people you split expenses with — they'll appear when you create a shared expense."
          action={<GlassButton onClick={() => setCreating(true)}>Add member</GlassButton>}
        />
      ) : (
        <div className="space-y-6">
          <ul className="glass-panel divide-y divide-hairline/50 rounded-xl border border-hairline/60">
            {active.map((member) => {
              const spentMinor = spentByMember.get(member.id);
              return (
                <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  {editingId === member.id ? (
                    <form
                      className="flex flex-1 gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        m.update.mutate(
                          { id: member.id, input: { name: editName.trim() } },
                          { onSuccess: () => setEditingId(null) },
                        );
                      }}
                    >
                      <GlassInput
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                      <GlassButton type="submit" disabled={!editName.trim()}>
                        Save
                      </GlassButton>
                    </form>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <GlassBadge tone="success">Active</GlassBadge>
                          {spentMinor != null && spentMinor > 0 ? (
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">
                              {formatMoney(spentMinor, "INR")} this month
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <GlassButton
                          variant="ghost"
                          className="px-2"
                          onClick={() => {
                            setEditingId(member.id);
                            setEditName(member.name);
                          }}
                        >
                          <Pencil className="size-4" />
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          className="px-2"
                          onClick={() =>
                            m.update.mutate({ id: member.id, input: { archived: true } })
                          }
                        >
                          <Archive className="size-4" />
                        </GlassButton>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {archived.length > 0 && (
            <div>
              <p className="label-eyebrow mb-2">Archived</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {archived.map((m) => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
