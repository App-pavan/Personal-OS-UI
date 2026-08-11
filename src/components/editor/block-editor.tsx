import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  block as makeBlock,
  CONTINUING,
  type Block,
  type BlockType,
  type EditorDoc,
} from "@/lib/editor/document";
import { filterCommands, type SlashCommand } from "./slash-commands";

/* ---------------------------------------------------------------
 * The universal document surface. It knows nothing about tasks or
 * checklists — it only edits blocks. Callers serialize.
 * ------------------------------------------------------------- */

type SlashState = { blockId: string; query: string; index: number } | null;

const typeClass: Record<BlockType, string> = {
  text: "text-[15px] leading-relaxed",
  h1: "text-2xl font-semibold tracking-tight leading-snug",
  h2: "text-xl font-semibold tracking-tight leading-snug",
  h3: "text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
  todo: "text-[15px] leading-relaxed",
  check: "text-[15px] leading-relaxed",
  bullet: "text-[15px] leading-relaxed",
  number: "text-[15px] leading-relaxed",
  toggle: "text-[15px] font-medium leading-relaxed",
  quote: "text-[15px] italic leading-relaxed text-muted-foreground",
  code: "font-mono text-[13px] leading-relaxed",
  divider: "",
  date: "text-[15px] leading-relaxed",
  link: "text-[15px] leading-relaxed text-primary underline-offset-4",
};

const placeholderFor = (b: Block, first: boolean) => {
  switch (b.type) {
    case "h1":
    case "h2":
    case "h3":
      return "Section";
    case "toggle":
      return "Group name";
    case "todo":
    case "check":
      return "List an item";
    case "bullet":
    case "number":
      return "List something";
    case "code":
      return "Code";
    case "quote":
      return "A quiet note";
    case "link":
      return "https://";
    default:
      return first ? 'Start writing, or press "/" for blocks' : 'Type "/" for more';
  }
};

export function BlockEditor({
  doc,
  onChange,
  titlePlaceholder = "Untitled",
  autoFocus = true,
  className,
}: {
  doc: EditorDoc;
  onChange: (next: EditorDoc) => void;
  titlePlaceholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [slash, setSlash] = useState<SlashState>(null);

  const setBlocks = useCallback(
    (blocks: Block[]) => onChange({ ...doc, blocks: blocks.length ? blocks : [makeBlock()] }),
    [doc, onChange],
  );

  const patch = useCallback(
    (id: string, next: Partial<Block>) =>
      setBlocks(doc.blocks.map((b) => (b.id === id ? { ...b, ...next } : b))),
    [doc.blocks, setBlocks],
  );

  const index = useCallback((id: string) => doc.blocks.findIndex((b) => b.id === id), [doc.blocks]);

  /* focus + autosize */
  useEffect(() => {
    if (!focusId) return;
    const el = refs.current.get(focusId);
    if (el) {
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }
    setFocusId(null);
  }, [focusId]);

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    autosize(titleRef.current);
    for (const el of refs.current.values()) autosize(el);
  }, [doc]);

  /* ---------- visibility (collapsed toggles) ---------- */
  const visible = useMemo(() => {
    const out: Block[] = [];
    let hideDeeper: number | null = null;
    for (const b of doc.blocks) {
      if (hideDeeper !== null && b.indent > hideDeeper) continue;
      hideDeeper = null;
      out.push(b);
      if (b.type === "toggle" && b.collapsed) hideDeeper = b.indent;
    }
    return out;
  }, [doc.blocks]);

  const numberOf = (b: Block) => {
    let n = 1;
    for (let i = index(b.id) - 1; i >= 0; i--) {
      const prev = doc.blocks[i]!;
      if (prev.type === "number" && prev.indent === b.indent) n++;
      else if (prev.indent < b.indent) break;
      else if (prev.type !== "number") break;
    }
    return n;
  };

  /* ---------- slash menu ---------- */
  const commands = slash ? filterCommands(slash.query) : [];

  const applyCommand = (b: Block, cmd: SlashCommand) => {
    setSlash(null);
    const stripped = b.text.replace(/\/[^/]*$/, "");

    if (cmd.type === "divider") {
      const fresh = makeBlock("text", "", b.indent);
      const next = doc.blocks.flatMap((x) =>
        x.id === b.id ? [{ ...x, type: "divider" as BlockType, text: "" }, fresh] : [x],
      );
      setBlocks(next);
      setFocusId(fresh.id);
      return;
    }

    if (cmd.type === "date") {
      const today = new Date().toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      patch(b.id, { type: "text", text: `${stripped}${today}` });
      setFocusId(b.id);
      return;
    }

    if (cmd.type === "link") {
      const url = window.prompt("Link URL");
      if (!url) {
        patch(b.id, { text: stripped });
        setFocusId(b.id);
        return;
      }
      patch(b.id, { type: "link", text: url.trim() });
      setFocusId(b.id);
      return;
    }

    patch(b.id, { type: cmd.type, text: stripped });
    setFocusId(b.id);
  };

  /* ---------- keyboard ---------- */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, b: Block) => {
    if (slash?.blockId === b.id && commands.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlash({ ...slash, index: (slash.index + 1) % commands.length });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlash({ ...slash, index: (slash.index - 1 + commands.length) % commands.length });
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const cmd = commands[Math.min(slash.index, commands.length - 1)];
        if (cmd) applyCommand(b, cmd);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSlash(null);
        return;
      }
    }

    const i = index(b.id);
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
    const atEnd = el.selectionStart === el.value.length && el.selectionEnd === el.value.length;

    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      // second Enter on an empty list item leaves the list
      if (CONTINUING.includes(b.type) && !b.text.trim()) {
        patch(b.id, { type: "text" });
        return;
      }
      const nextType: BlockType = CONTINUING.includes(b.type) ? b.type : "text";
      const indent = b.type === "toggle" ? b.indent + 1 : b.indent;
      const fresh = makeBlock(b.type === "toggle" ? "todo" : nextType, "", indent);
      const blocks = [...doc.blocks];
      blocks.splice(i + 1, 0, fresh);
      setBlocks(blocks);
      setFocusId(fresh.id);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      patch(b.id, { indent: e.shiftKey ? Math.max(0, b.indent - 1) : Math.min(3, b.indent + 1) });
      return;
    }

    if (e.key === "Backspace" && atStart && !el.value) {
      e.preventDefault();
      if (b.type !== "text") return patch(b.id, { type: "text" });
      if (b.indent > 0) return patch(b.id, { indent: b.indent - 1 });
      if (doc.blocks.length === 1) return;
      const prev = doc.blocks[i - 1];
      setBlocks(doc.blocks.filter((x) => x.id !== b.id));
      if (prev) setFocusId(prev.id);
      return;
    }

    if (e.key === "ArrowUp" && atStart) {
      const prev = visible[visible.findIndex((x) => x.id === b.id) - 1];
      if (prev) {
        e.preventDefault();
        setFocusId(prev.id);
      }
      return;
    }
    if (e.key === "ArrowDown" && atEnd) {
      const next = visible[visible.findIndex((x) => x.id === b.id) + 1];
      if (next) {
        e.preventDefault();
        setFocusId(next.id);
      }
    }
  };

  const onInput = (b: Block, value: string) => {
    patch(b.id, { text: value });
    const match = /\/([^/\s]*)$/.exec(value);
    if (match) setSlash({ blockId: b.id, query: match[1] ?? "", index: 0 });
    else if (slash?.blockId === b.id) setSlash(null);
  };

  /* ---------- render ---------- */
  return (
    <div className={cn("min-w-0", className)}>
      <textarea
        ref={titleRef}
        value={doc.title}
        rows={1}
        placeholder={titlePlaceholder}
        aria-label="Title"
        onChange={(e) => onChange({ ...doc, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const first = doc.blocks[0];
            if (first) setFocusId(first.id);
          }
        }}
        className="w-full resize-none border-0 bg-transparent text-[28px] leading-tight font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50 md:text-[32px]"
      />

      <div className="mt-4 space-y-0.5">
        {visible.map((b, vi) => {
          if (b.type === "divider")
            return (
              <div key={b.id} className="group/row flex items-center gap-2 py-2.5">
                <div className="h-px flex-1 bg-hairline" />
                <button
                  aria-label="Remove divider"
                  onClick={() => setBlocks(doc.blocks.filter((x) => x.id !== b.id))}
                  className="opacity-0 transition group-hover/row:opacity-100"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            );

          const showSlash = slash?.blockId === b.id && commands.length > 0;

          return (
            <div
              key={b.id}
              className="group/row relative flex items-start gap-2"
              style={{ paddingLeft: `${b.indent * 22}px` }}
            >
              {/* leading affordance */}
              <div className="flex h-7 w-5 shrink-0 items-center justify-center">
                {b.type === "todo" || b.type === "check" ? (
                  <button
                    role="checkbox"
                    aria-checked={Boolean(b.checked)}
                    aria-label={b.text || "Item"}
                    onClick={() => patch(b.id, { checked: !b.checked })}
                    className={cn(
                      "grid size-[18px] place-items-center rounded-[5px] border transition active:scale-95",
                      b.checked
                        ? "border-transparent bg-primary text-primary-foreground"
                        : b.type === "check"
                          ? "border-primary/60 text-transparent"
                          : "border-input text-transparent hover:border-primary",
                    )}
                  >
                    <Check className="size-3" />
                  </button>
                ) : b.type === "toggle" ? (
                  <button
                    aria-label={b.collapsed ? "Expand group" : "Collapse group"}
                    onClick={() => patch(b.id, { collapsed: !b.collapsed })}
                    className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted/70"
                  >
                    <ChevronRight className={cn("size-4 transition", !b.collapsed && "rotate-90")} />
                  </button>
                ) : b.type === "bullet" ? (
                  <span className="size-1.5 rounded-full bg-muted-foreground" />
                ) : b.type === "number" ? (
                  <span className="text-xs text-muted-foreground tabular-nums">{numberOf(b)}.</span>
                ) : (
                  <GripVertical className="size-3.5 text-muted-foreground/0 transition group-hover/row:text-muted-foreground/40" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  ref={(el) => {
                    if (el) refs.current.set(b.id, el);
                    else refs.current.delete(b.id);
                    autosize(el);
                  }}
                  rows={1}
                  value={b.text}
                  placeholder={placeholderFor(b, vi === 0)}
                  aria-label={b.type}
                  onChange={(e) => onInput(b, e.target.value)}
                  onKeyDown={(e) => onKeyDown(e, b)}
                  className={cn(
                    "w-full resize-none border-0 bg-transparent py-1 outline-none placeholder:text-muted-foreground/45",
                    typeClass[b.type],
                    b.checked && "text-muted-foreground line-through",
                    b.type === "quote" && "border-l border-hairline pl-3",
                    b.type === "code" && "rounded-md bg-muted/60 px-3 py-2",
                  )}
                />

                {showSlash ? (
                  <SlashMenu
                    commands={commands}
                    active={Math.min(slash!.index, commands.length - 1)}
                    onPick={(cmd) => applyCommand(b, cmd)}
                    onHover={(i) => setSlash((s) => (s ? { ...s, index: i } : s))}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const fresh = makeBlock();
          setBlocks([...doc.blocks, fresh]);
          setFocusId(fresh.id);
        }}
        className="mt-3 flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <span className="text-base leading-none">+</span> Type “/” for more
      </button>
    </div>
  );
}

function SlashMenu({
  commands,
  active,
  onPick,
  onHover,
}: {
  commands: SlashCommand[];
  active: number;
  onPick: (cmd: SlashCommand) => void;
  onHover: (i: number) => void;
}) {
  return (
    <div className="glass-panel animate-soft-in absolute left-0 z-50 mt-1 w-[280px] rounded-xl p-1.5 shadow-float">
      <p className="label-eyebrow px-2 pt-1 pb-1.5">Add something</p>
      <div className="max-h-[264px] overflow-y-auto">
        {commands.map((c, i) => (
          <button
            key={c.id}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(c);
            }}
            onMouseEnter={() => onHover(i)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left",
              i === active ? "bg-primary-soft text-primary" : "text-foreground/85",
            )}
          >
            <c.icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{c.label}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{c.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
