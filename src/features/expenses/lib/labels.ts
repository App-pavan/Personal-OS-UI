import type { TransactionOwnership, TransactionSource, TransactionStatus } from "@/lib/api/expense-types";

export const statusLabel: Record<TransactionStatus, string> = {
  pending: "Pending",
  managed: "Managed",
  ignored: "Ignored",
  archived: "Archived",
};

export const statusTone: Record<TransactionStatus, "warning" | "success" | "muted" | "info"> = {
  pending: "warning",
  managed: "success",
  ignored: "muted",
  archived: "info",
};

export const ownershipLabel: Record<TransactionOwnership, string> = {
  personal: "Personal",
  split: "Shared",
};

export const sourceLabel: Record<TransactionSource, string> = {
  manual: "Manual",
  sms: "SMS",
  bank: "Bank",
  import: "Import",
  ai: "AI",
  ocr: "OCR",
  api: "API",
};

export function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}
