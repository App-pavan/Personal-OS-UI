import type { ExpenseMember, MemberAnalyticsRow } from "@/lib/api/expense-types";

export function truncateLabel(value: string, max = 18): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/** Resolve member names from the members directory when analytics rows omit them. */
export function enrichMemberAnalytics(
  rows: MemberAnalyticsRow[],
  members: ExpenseMember[],
): MemberAnalyticsRow[] {
  if (!rows.length) return rows;
  const byId = new Map(members.map((member) => [member.id, member.name]));
  return rows.map((row) => {
    const fromDirectory = byId.get(row.memberId);
    const resolved =
      row.memberName && row.memberName !== "Member"
        ? row.memberName
        : (fromDirectory ?? row.memberName);
    return {
      ...row,
      memberName: resolved?.trim() || "Unknown member",
    };
  });
}
