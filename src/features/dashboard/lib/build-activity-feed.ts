import type { ExpenseTransaction } from "@/lib/api/expense-types";
import type { TaskSummary } from "@/lib/api/types";
import type { WealthOverview } from "@/lib/api/wealth-types";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  ListChecks,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { displayCategoryLabel } from "@/features/expenses/lib/category-resolve";
import type { ExpenseCategory } from "@/lib/api/expense-types";
import { transactionDisplayTitle } from "@/features/expenses/lib/sms-duplicate-matcher";

export type DashboardActivityItem = {
  id: string;
  icon: LucideIcon;
  description: string;
  timestamp: string;
  to?: string;
  search?: Record<string, unknown>;
  tone?: "primary" | "aqua" | "success" | "secondary" | "info";
};

function taskEvents(tasks: TaskSummary[]): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];
  for (const task of tasks) {
    if (task.completedAt) {
      items.push({
        id: `task-completed-${task.id}`,
        icon: CheckCircle2,
        description: `Completed task "${task.title}"`,
        timestamp: task.completedAt,
        to: "/tasks",
        search: { taskId: task.id },
        tone: "success",
      });
    }
    if (task.createdAt) {
      items.push({
        id: `task-created-${task.id}`,
        icon: ListChecks,
        description: `Created task "${task.title}"`,
        timestamp: task.createdAt,
        to: "/tasks",
        search: { taskId: task.id },
        tone: "primary",
      });
    }
  }
  return items;
}

function transactionEvents(
  transactions: ExpenseTransaction[],
  categories: ExpenseCategory[],
): DashboardActivityItem[] {
  return transactions.map((tx) => {
    const label = displayCategoryLabel(tx, categories);
    const title = transactionDisplayTitle(tx) || tx.merchant;
    const sign = tx.direction === "credit" ? "+" : "-";
    return {
      id: `expense-${tx.id}`,
      icon: Wallet,
      description: `${tx.direction === "credit" ? "Income" : "Expense"} ${sign}${formatMoney(tx.amountMinor, tx.currency)} (${label}) · ${title}`,
      timestamp: tx.updatedAt ?? tx.occurredAt,
      to: "/expenses",
      tone: "aqua",
    };
  });
}

function wealthEvent(overview: WealthOverview | undefined): DashboardActivityItem[] {
  if (!overview?.lastSyncedAt) return [];
  return [
    {
      id: "wealth-sync",
      icon: TrendingUp,
      description: "Portfolio data synced",
      timestamp: overview.lastSyncedAt,
      to: "/wealth",
      tone: "secondary",
    },
  ];
}

/** Derive a chronological activity feed from available module data (no unified audit API). */
export function buildActivityFeed(input: {
  tasks: TaskSummary[];
  transactions: ExpenseTransaction[];
  categories: ExpenseCategory[];
  wealth?: WealthOverview;
  limit?: number;
}): DashboardActivityItem[] {
  const { tasks, transactions, categories, wealth, limit = 8 } = input;
  const merged = [
    ...taskEvents(tasks),
    ...transactionEvents(transactions, categories),
    ...wealthEvent(wealth),
  ];
  return merged
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/** Placeholder icon for device-related activity when no audit stream exists. */
export const deviceActivityIcon = Smartphone;
