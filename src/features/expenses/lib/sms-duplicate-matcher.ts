import type { ExpenseTransaction } from "@/lib/api/expense-types";

const MATCH_WINDOW_MS = 3 * 60 * 1000;

export function normalizeMatchText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function normalizeSmsBody(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function transactionDisplayTitle(tx: ExpenseTransaction): string {
  return tx.displayName?.trim() || tx.merchant?.trim() || "";
}

function transactionTimeMs(tx: ExpenseTransaction): number {
  return new Date(tx.occurredAt).getTime();
}

function titlesMatch(a: ExpenseTransaction, b: ExpenseTransaction): boolean {
  const left = normalizeMatchText(transactionDisplayTitle(a));
  const right = normalizeMatchText(transactionDisplayTitle(b));
  return Boolean(left && right && left === right);
}

function smsBodiesMatch(a: ExpenseTransaction, b: ExpenseTransaction): boolean {
  const left = a.sms?.rawContent;
  const right = b.sms?.rawContent;
  if (!left || !right) return false;
  return normalizeSmsBody(left) === normalizeSmsBody(right);
}

/** Two SMS rows describe the same bank payment. */
export function isSameSmsPayment(a: ExpenseTransaction, b: ExpenseTransaction): boolean {
  if (a.id === b.id) return false;
  if (a.source !== "sms" || b.source !== "sms") return false;
  if (a.amountMinor !== b.amountMinor) return false;
  if (a.currency !== b.currency) return false;

  const timeDelta = Math.abs(transactionTimeMs(a) - transactionTimeMs(b));
  if (timeDelta > MATCH_WINDOW_MS) return false;

  return titlesMatch(a, b) || smsBodiesMatch(a, b);
}

function statusRank(status: ExpenseTransaction["status"]): number {
  if (status === "managed") return 3;
  if (status === "pending") return 2;
  if (status === "ignored") return 1;
  return 0;
}

/** Pick the row to show when several SMS rows match the same payment. */
export function pickSmsDuplicateWinner(cluster: ExpenseTransaction[]): ExpenseTransaction {
  return [...cluster].sort((a, b) => {
    const statusDiff = statusRank(b.status) - statusRank(a.status);
    if (statusDiff !== 0) return statusDiff;

    const categoryDiff = Number(Boolean(b.categoryId)) - Number(Boolean(a.categoryId));
    if (categoryDiff !== 0) return categoryDiff;

    return transactionTimeMs(a) - transactionTimeMs(b);
  })[0]!;
}

export type SmsDuplicateCluster = {
  winner: ExpenseTransaction;
  losers: ExpenseTransaction[];
  members: ExpenseTransaction[];
};

function buildClusters(transactions: ExpenseTransaction[]): SmsDuplicateCluster[] {
  const smsRows = transactions.filter((tx) => tx.source === "sms");
  const visited = new Set<string>();
  const clusters: SmsDuplicateCluster[] = [];

  for (const seed of smsRows) {
    if (visited.has(seed.id)) continue;

    const members = smsRows.filter((candidate) => {
      if (candidate.id === seed.id) return true;
      return isSameSmsPayment(seed, candidate);
    });

    if (members.length <= 1) continue;

    for (const member of members) visited.add(member.id);

    const winner = pickSmsDuplicateWinner(members);
    clusters.push({
      winner,
      losers: members.filter((tx) => tx.id !== winner.id),
      members,
    });
  }

  return clusters;
}

export function collapseSmsDuplicates(transactions: ExpenseTransaction[]): ExpenseTransaction[] {
  if (transactions.length <= 1) return transactions;

  const hidden = new Set<string>();
  for (const cluster of buildClusters(transactions)) {
    for (const loser of cluster.losers) hidden.add(loser.id);
  }

  return transactions.filter((tx) => !hidden.has(tx.id));
}

export function findSmsDuplicateClusters(
  transactions: ExpenseTransaction[],
): SmsDuplicateCluster[] {
  return buildClusters(transactions);
}

/** Pending SMS clones that should be ignored when a managed twin exists. */
export function pendingSmsClonesToIgnore(
  transactions: ExpenseTransaction[],
): ExpenseTransaction[] {
  const toIgnore: ExpenseTransaction[] = [];

  for (const cluster of buildClusters(transactions)) {
    if (cluster.winner.status !== "managed") continue;
    for (const loser of cluster.losers) {
      if (loser.status === "pending") toIgnore.push(loser);
    }
  }

  return toIgnore;
}

/** Map a hidden pending clone id to its visible managed twin when possible. */
export function resolveCanonicalTransactionId(
  id: string,
  transactions: ExpenseTransaction[],
): string {
  const target = transactions.find((tx) => tx.id === id);
  if (!target) return id;

  for (const cluster of buildClusters(transactions)) {
    if (!cluster.members.some((tx) => tx.id === id)) continue;
    return cluster.winner.id;
  }

  return id;
}
