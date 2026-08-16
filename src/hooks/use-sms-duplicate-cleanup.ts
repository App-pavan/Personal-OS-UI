import { useEffect, useRef } from "react";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { pendingSmsClonesToIgnore } from "@/features/expenses/lib/sms-duplicate-matcher";
import { useTransactionMutations, useTransactions } from "@/hooks/use-expenses";

const CLEANUP_SESSION_KEY = "expenses.smsDuplicateCleanup.ids";

function readIgnoredSessionIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(CLEANUP_SESSION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function rememberIgnoredSessionIds(ids: string[]) {
  if (ids.length === 0) return;
  const existing = readIgnoredSessionIds();
  for (const id of ids) existing.add(id);
  sessionStorage.setItem(CLEANUP_SESSION_KEY, JSON.stringify([...existing]));
}

/** Background fetch wide enough to pair managed/pending SMS clones across pages. */
export function useSmsDuplicateCleanupPool() {
  return useTransactions({
    limit: 120,
    sort: "occurredAt",
    order: "desc",
  });
}

/** Ignore pending SMS clones when a managed twin exists. Safe to mount on expense pages. */
export function useSmsDuplicateCleanup(transactions: ExpenseTransaction[] | undefined) {
  const { ignore } = useTransactionMutations();
  const runningRef = useRef(false);
  const attemptedRef = useRef(new Set<string>());
  const ignoreAsync = ignore.mutateAsync;

  useEffect(() => {
    if (!transactions?.length || runningRef.current || ignore.isPending) return;

    const sessionIgnored = readIgnoredSessionIds();
    const candidates = pendingSmsClonesToIgnore(transactions).filter(
      (tx) => !sessionIgnored.has(tx.id) && !attemptedRef.current.has(tx.id),
    );
    if (candidates.length === 0) return;

    let cancelled = false;

    const run = async () => {
      runningRef.current = true;
      const ignoredNow: string[] = [];

      for (const tx of candidates) {
        if (cancelled) break;
        attemptedRef.current.add(tx.id);
        try {
          await ignoreAsync(tx.id);
          ignoredNow.push(tx.id);
        } catch {
          // Leave the row collapsed in UI; retry on a later load.
        }
      }

      if (ignoredNow.length > 0) rememberIgnoredSessionIds(ignoredNow);
      runningRef.current = false;
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [transactions, ignore.isPending, ignoreAsync]);
}
