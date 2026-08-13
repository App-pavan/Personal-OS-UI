import {
  BookOpen,
  Car,
  CreditCard,
  Fuel,
  Gamepad2,
  HeartPulse,
  HelpCircle,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SemanticTone } from "@/lib/design/semantic";

export type CategoryMeta = {
  icon: LucideIcon;
  tone: SemanticTone;
  /** CSS color token for charts */
  color: string;
};

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  food: { icon: Utensils, tone: "orange", color: "var(--accent-orange)" },
  dining: { icon: Utensils, tone: "orange", color: "var(--accent-orange)" },
  groceries: { icon: ShoppingBag, tone: "success", color: "var(--accent-green)" },
  grocery: { icon: ShoppingBag, tone: "success", color: "var(--accent-green)" },
  fuel: { icon: Fuel, tone: "warning", color: "var(--accent-yellow)" },
  transport: { icon: Car, tone: "warning", color: "var(--accent-yellow)" },
  travel: { icon: Plane, tone: "secondary", color: "var(--accent-violet)" },
  shopping: { icon: ShoppingBag, tone: "accent", color: "var(--accent-pink)" },
  bills: { icon: Receipt, tone: "info", color: "var(--accent-blue)" },
  utilities: { icon: Zap, tone: "primary", color: "var(--accent-cyan)" },
  entertainment: { icon: Gamepad2, tone: "purple", color: "var(--accent-purple)" },
  health: { icon: HeartPulse, tone: "success", color: "var(--accent-green)" },
  medical: { icon: HeartPulse, tone: "success", color: "var(--accent-green)" },
  education: { icon: BookOpen, tone: "info", color: "var(--accent-blue)" },
  subscriptions: { icon: Repeat, tone: "accent", color: "var(--accent-pink)" },
  subscription: { icon: Repeat, tone: "accent", color: "var(--accent-pink)" },
  finance: { icon: CreditCard, tone: "secondary", color: "var(--accent-violet)" },
  other: { icon: HelpCircle, tone: "muted", color: "var(--accent-muted)" },
  uncategorised: { icon: HelpCircle, tone: "muted", color: "var(--accent-muted)" },
};

const FALLBACK_PALETTE: CategoryMeta[] = [
  { icon: Sparkles, tone: "primary", color: "var(--accent-cyan)" },
  { icon: Utensils, tone: "orange", color: "var(--accent-orange)" },
  { icon: ShoppingBag, tone: "accent", color: "var(--accent-pink)" },
  { icon: Plane, tone: "secondary", color: "var(--accent-violet)" },
  { icon: Receipt, tone: "info", color: "var(--accent-blue)" },
  { icon: Fuel, tone: "warning", color: "var(--accent-yellow)" },
  { icon: Gamepad2, tone: "purple", color: "var(--accent-purple)" },
  { icon: HeartPulse, tone: "success", color: "var(--accent-green)" },
];

function normalize(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hashIndex(name: string, max: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % max;
}

/** Resolve category icon, tone, and chart color from name. */
export function getCategoryMeta(name?: string | null, id?: string): CategoryMeta {
  if (!name || normalize(name) === "uncategorised") {
    return CATEGORY_MAP.uncategorised!;
  }
  const key = normalize(name);
  const direct = CATEGORY_MAP[key];
  if (direct) return direct;
  for (const [k, meta] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(k) || k.includes(key)) return meta;
  }
  const idx = hashIndex(id ?? key, FALLBACK_PALETTE.length);
  return FALLBACK_PALETTE[idx]!;
}

/** Stable chart color for a category (by id or name). */
export function getCategoryColor(name?: string | null, id?: string): string {
  return getCategoryMeta(name, id).color;
}
