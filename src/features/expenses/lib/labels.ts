import type {
  TransactionOwnership,
  TransactionSource,
  TransactionStatus,
} from "@/lib/api/expense-types";
import type { SemanticTone } from "@/lib/design/semantic";

export const statusLabel: Record<TransactionStatus, string> = {
  pending: "Pending",
  managed: "Managed",
  ignored: "Ignored",
  archived: "Archived",
};

export const statusTone: Record<TransactionStatus, SemanticTone> = {
  pending: "warning",
  managed: "success",
  ignored: "muted",
  archived: "secondary",
};

export const ownershipLabel: Record<TransactionOwnership, string> = {
  personal: "Personal",
  split: "Shared",
};

export const ownershipTone: Record<TransactionOwnership, SemanticTone> = {
  personal: "primary",
  split: "info",
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

export const sourceTone: Record<TransactionSource, SemanticTone> = {
  manual: "primary",
  sms: "secondary",
  bank: "info",
  import: "orange",
  ai: "purple",
  ocr: "accent",
  api: "success",
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
