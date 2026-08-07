import { useSyncExternalStore } from "react";

/* ---------------------------------------------------------------
 * Personal OS — client state layer.
 * A tiny external store so every surface (Home briefing, Tasks,
 * Notes, search, AI context) reads from the same living data.
 * ------------------------------------------------------------- */

export type Priority = "low" | "normal" | "urgent";

export type TaskLink = {
  kind: "project" | "person" | "document" | "note" | "event" | "money" | "place";
  label: string;
};

export type Intent = {
  id: string;
  title: string;
  detail?: string;
  when?: string;
  window?: "now" | "today" | "soon" | "someday";
  priority: Priority;
  done: boolean;
  space: string;
  links: TaskLink[];
  subtasks: { id: string; title: string; done: boolean }[];
  history: { when: string; what: string }[];
  aiNote?: string;
};

export type Block = {
  id: string;
  type: "h1" | "h2" | "text" | "todo" | "quote" | "code" | "callout" | "divider";
  text: string;
  done?: boolean;
};

export type Doc = {
  id: string;
  title: string;
  glyph: string;
  collection: string;
  pinned: boolean;
  updated: string;
  tags: string[];
  blocks: Block[];
  linked: string[];
};

type State = {
  unlocked: boolean;
  hydrated: boolean;
  intents: Intent[];
  docs: Doc[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const seedIntents: Intent[] = [
  {
    id: "i1",
    title: "Renew the home insurance policy",
    detail: "Cover lapses on the 14th. Last year's premium was ₹18,400.",
    when: "Today · before 6:30 PM",
    window: "now",
    priority: "urgent",
    done: false,
    space: "Household",
    links: [
      { kind: "document", label: "Home insurance 2026.pdf" },
      { kind: "money", label: "₹18,400 expected" },
      { kind: "person", label: "Meera" },
    ],
    subtasks: [
      { id: "s1", title: "Compare two quotes", done: true },
      { id: "s2", title: "Confirm contents cover", done: false },
      { id: "s3", title: "Pay and file the receipt", done: false },
    ],
    history: [
      { when: "2 days ago", what: "Reminder surfaced from the document vault" },
      { when: "Yesterday", what: "You saved a quote from ICICI" },
    ],
    aiNote:
      "This is the only thing today with a hard deadline. The renewal page is already in your vault — 10 minutes of work.",
  },
  {
    id: "i2",
    title: "Rotate the NAS backup encryption keys",
    detail: "Quarterly rotation. Vault entry is 92 days old.",
    when: "Today · evening",
    window: "today",
    priority: "urgent",
    done: false,
    space: "Infrastructure",
    links: [
      { kind: "project", label: "Home infrastructure" },
      { kind: "note", label: "Home server ideas" },
      { kind: "place", label: "Study · rack" },
    ],
    subtasks: [
      { id: "s4", title: "Snapshot current volume", done: false },
      { id: "s5", title: "Generate new keypair", done: false },
    ],
    history: [{ when: "92 days ago", what: "Keys last rotated" }],
    aiNote: "Do this after the family dinner — the array is idle after 21:00.",
  },
  {
    id: "i3",
    title: "Book Aarav's dentist appointment",
    when: "Tomorrow",
    window: "soon",
    priority: "normal",
    done: false,
    space: "Family",
    links: [
      { kind: "person", label: "Aarav" },
      { kind: "event", label: "School holiday · Fri" },
    ],
    subtasks: [],
    history: [{ when: "Last week", what: "Meera mentioned this in Family" }],
    aiNote: "Friday is a school holiday — the 11:00 slot fits without missing class.",
  },
  {
    id: "i4",
    title: "Shape the Kerala trip itinerary",
    detail: "Four days, two of them slow.",
    when: "This week",
    window: "soon",
    priority: "normal",
    done: false,
    space: "Travel",
    links: [
      { kind: "project", label: "Kerala 2026" },
      { kind: "note", label: "Places to stay" },
      { kind: "money", label: "₹15,000 budget left" },
    ],
    subtasks: [
      { id: "s6", title: "Pick the houseboat night", done: false },
      { id: "s7", title: "Lock the train back", done: false },
    ],
    history: [],
    aiNote: "Flights are cheapest on the 12th — ₹2,100 less than the 14th.",
  },
  {
    id: "i5",
    title: "Archive the 2025 tax documents",
    when: "Someday",
    window: "someday",
    priority: "low",
    done: false,
    space: "Documents",
    links: [{ kind: "document", label: "Tax return 2025.pdf" }],
    subtasks: [],
    history: [],
  },
  {
    id: "i6",
    title: "Morning walk · 5 km",
    when: "Today · done 6:40 AM",
    window: "today",
    priority: "low",
    done: true,
    space: "Health",
    links: [{ kind: "place", label: "Riverside loop" }],
    subtasks: [],
    history: [{ when: "Today", what: "Completed automatically from your watch" }],
  },
];

const seedDocs: Doc[] = [
  {
    id: "d1",
    title: "Home server, second pass",
    glyph: "◎",
    collection: "Infrastructure",
    pinned: true,
    updated: "12 minutes ago",
    tags: ["nas", "homelab", "backup"],
    linked: ["Weekly review", "Kerala 2026"],
    blocks: [
      { id: "b1", type: "h1", text: "Home server, second pass" },
      {
        id: "b2",
        type: "text",
        text: "The point of the rebuild is not more storage. It is fewer decisions later — one array, one backup path, one place to look when something breaks.",
      },
      { id: "b3", type: "callout", text: "Rule: nothing lives in only one place." },
      { id: "b4", type: "h2", text: "Open questions" },
      { id: "b5", type: "todo", text: "Does the 10G card fit the current case?", done: false },
      { id: "b6", type: "todo", text: "Move Photos off the SSD pool", done: true },
      { id: "b7", type: "code", text: "zfs send tank/photos | ssh vault receive cold/photos" },
      {
        id: "b8",
        type: "quote",
        text: "A system you cannot explain in one paragraph is a system you will not maintain.",
      },
    ],
  },
  {
    id: "d2",
    title: "Weekly review",
    glyph: "◈",
    collection: "Journal",
    pinned: true,
    updated: "Yesterday",
    tags: ["ritual", "review"],
    linked: ["Home server, second pass"],
    blocks: [
      { id: "b9", type: "h1", text: "Weekly review" },
      { id: "b10", type: "text", text: "Three questions, same order, every Sunday evening." },
      { id: "b11", type: "todo", text: "What actually moved this week?", done: false },
      { id: "b12", type: "todo", text: "What did I carry for no reason?", done: false },
      { id: "b13", type: "todo", text: "What deserves attention next week?", done: false },
    ],
  },
  {
    id: "d3",
    title: "Books, half-read",
    glyph: "❖",
    collection: "Reading",
    pinned: false,
    updated: "2 days ago",
    tags: ["reading"],
    linked: [],
    blocks: [
      { id: "b14", type: "h1", text: "Books, half-read" },
      { id: "b15", type: "text", text: "Not a backlog. A record of what I was curious about." },
      { id: "b16", type: "todo", text: "The Beginning of Infinity — ch. 7", done: false },
      { id: "b17", type: "todo", text: "Seeing Like a State — ch. 3", done: false },
    ],
  },
  {
    id: "d4",
    title: "Kerala, slowly",
    glyph: "✳",
    collection: "Travel",
    pinned: false,
    updated: "4 days ago",
    tags: ["travel", "kerala"],
    linked: ["Weekly review"],
    blocks: [
      { id: "b18", type: "h1", text: "Kerala, slowly" },
      { id: "b19", type: "text", text: "Two days of movement, two days of nothing at all." },
      { id: "b20", type: "callout", text: "Houseboat only if it is quiet. Otherwise a homestay." },
    ],
  },
];

let state: State = { unlocked: false, hydrated: false, intents: seedIntents, docs: seedDocs };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => state;
const getServerSnapshot = () => state;

export function useOS() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ---------- session (single master account, local gate) ---------- */

const KEY = "personal-os:session";

export const session = {
  hydrate() {
    if (state.hydrated) return;
    let unlocked = false;
    try {
      unlocked = window.localStorage.getItem(KEY) === "open";
    } catch {
      unlocked = false;
    }
    set({ unlocked, hydrated: true });
  },
  unlock() {
    try {
      window.localStorage.setItem(KEY, "open");
    } catch {
      /* ignore */
    }
    set({ unlocked: true });
  },
  lock() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    set({ unlocked: false });
  },
};

/* ---------- intents ---------- */

export const intents = {
  add(title: string, partial?: Partial<Intent>) {
    const intent: Intent = {
      id: uid(),
      title,
      window: "today",
      when: "Today",
      priority: "normal",
      done: false,
      space: "Inbox",
      links: [],
      subtasks: [],
      history: [{ when: "Just now", what: "Captured from quick capture" }],
      ...partial,
    };
    set({ intents: [intent, ...state.intents] });
    return intent.id;
  },
  toggle(id: string) {
    set({
      intents: state.intents.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    });
  },
  toggleSub(id: string, subId: string) {
    set({
      intents: state.intents.map((i) =>
        i.id === id
          ? {
              ...i,
              subtasks: i.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
            }
          : i,
      ),
    });
  },
  addSub(id: string, title: string) {
    set({
      intents: state.intents.map((i) =>
        i.id === id ? { ...i, subtasks: [...i.subtasks, { id: uid(), title, done: false }] } : i,
      ),
    });
  },
  setPriority(id: string, priority: Priority) {
    set({ intents: state.intents.map((i) => (i.id === id ? { ...i, priority } : i)) });
  },
};

/* ---------- docs ---------- */

export const docs = {
  add(title: string) {
    const doc: Doc = {
      id: uid(),
      title: title || "Untitled",
      glyph: "◌",
      collection: "Inbox",
      pinned: false,
      updated: "Just now",
      tags: [],
      linked: [],
      blocks: [
        { id: uid(), type: "h1", text: title || "Untitled" },
        { id: uid(), type: "text", text: "" },
      ],
    };
    set({ docs: [doc, ...state.docs] });
    return doc.id;
  },
  pin(id: string) {
    set({ docs: state.docs.map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d)) });
  },
  toggleBlock(docId: string, blockId: string) {
    set({
      docs: state.docs.map((d) =>
        d.id === docId
          ? {
              ...d,
              updated: "Just now",
              blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, done: !b.done } : b)),
            }
          : d,
      ),
    });
  },
  writeBlock(docId: string, blockId: string, text: string) {
    set({
      docs: state.docs.map((d) =>
        d.id === docId
          ? {
              ...d,
              updated: "Just now",
              blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)),
            }
          : d,
      ),
    });
  },
  addBlock(docId: string, type: Block["type"], after?: string) {
    const block: Block = { id: uid(), type, text: "", done: type === "todo" ? false : undefined };
    set({
      docs: state.docs.map((d) => {
        if (d.id !== docId) return d;
        const idx = after ? d.blocks.findIndex((b) => b.id === after) : d.blocks.length - 1;
        const blocks = [...d.blocks];
        blocks.splice(idx + 1, 0, block);
        return { ...d, blocks, updated: "Just now" };
      }),
    });
    return block.id;
  },
};
