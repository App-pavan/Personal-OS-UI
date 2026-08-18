import { formatMoney, percentOf } from "@/lib/money";
import { semanticTextClasses, type SemanticTone } from "@/lib/design/semantic";

export function formatPnlMinor(amountMinor: number, currency: string, signed = true): string {
  return formatMoney(amountMinor, currency, { signed: signed && amountMinor > 0 });
}

export function formatPnlPercent(value: number, signed = true): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0) return "0%";
  const prefix = signed && rounded > 0 ? "+" : "";
  return `${prefix}${rounded}%`;
}

export function pnlTone(amountMinor: number): SemanticTone {
  if (amountMinor > 0) return "success";
  if (amountMinor < 0) return "danger";
  return "muted";
}

export function pnlTextClass(amountMinor: number): string {
  return semanticTextClasses(pnlTone(amountMinor));
}

export function formatRelativeTime(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export { percentOf };
