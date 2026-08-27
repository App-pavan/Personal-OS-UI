import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Square,
  Type,
} from "lucide-react";
import type { BlockType } from "@/lib/editor/document";

export type SlashCommand = {
  id: string;
  label: string;
  hint: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  type: BlockType;
};

/**
 * Only commands the editor can actually produce. Attachments and
 * file blocks are intentionally absent until the backend exposes
 * uploads — the architecture accepts new entries, not fake ones.
 */
export const slashCommands: SlashCommand[] = [
  {
    id: "todo",
    label: "To-do",
    hint: "A step you can tick off",
    keywords: ["todo", "task", "step", "check"],
    icon: Square,
    type: "todo",
  },
  {
    id: "check",
    label: "Checklist",
    hint: "A required checklist item",
    keywords: ["checklist", "check", "required", "packing"],
    icon: CheckSquare,
    type: "check",
  },
  {
    id: "toggle",
    label: "Toggle",
    hint: "Group items under a heading",
    keywords: ["toggle", "group", "section", "collapse"],
    icon: ChevronDown,
    type: "toggle",
  },
  {
    id: "h1",
    label: "Heading 1",
    hint: "Big section title",
    keywords: ["h1", "heading", "title", "big"],
    icon: Heading1,
    type: "h1",
  },
  {
    id: "h2",
    label: "Heading 2",
    hint: "Section title",
    keywords: ["h2", "heading", "subtitle"],
    icon: Heading2,
    type: "h2",
  },
  {
    id: "h3",
    label: "Heading 3",
    hint: "Small group label",
    keywords: ["h3", "heading", "group", "category"],
    icon: Heading3,
    type: "h3",
  },
  {
    id: "bullet",
    label: "Bullet list",
    hint: "Simple list",
    keywords: ["bullet", "list", "ul", "dash"],
    icon: List,
    type: "bullet",
  },
  {
    id: "number",
    label: "Numbered list",
    hint: "Ordered steps",
    keywords: ["number", "ordered", "ol", "steps", "1"],
    icon: ListOrdered,
    type: "number",
  },
  {
    id: "text",
    label: "Text",
    hint: "Plain paragraph",
    keywords: ["text", "paragraph", "note", "body"],
    icon: Type,
    type: "text",
  },
  {
    id: "quote",
    label: "Note",
    hint: "Quiet aside",
    keywords: ["note", "quote", "callout", "aside"],
    icon: Quote,
    type: "quote",
  },
  {
    id: "code",
    label: "Code",
    hint: "Monospaced block",
    keywords: ["code", "mono", "snippet"],
    icon: Code2,
    type: "code",
  },
  {
    id: "divider",
    label: "Divider",
    hint: "A quiet separator",
    keywords: ["divider", "line", "hr", "separator"],
    icon: Minus,
    type: "divider",
  },
  {
    id: "date",
    label: "Date",
    hint: "Insert today's date as text",
    keywords: ["date", "day", "today", "when"],
    icon: CalendarDays,
    type: "date",
  },
  {
    id: "link",
    label: "Link",
    hint: "Paste a URL as a link line",
    keywords: ["link", "url", "web", "href"],
    icon: Link2,
    type: "link",
  },
];

export function filterCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return slashCommands;
  return slashCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(q) || c.keywords.some((k) => k.startsWith(q) || k.includes(q)),
  );
}
