import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Link2, Pin, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { docs as actions, useOS, type Block } from "@/lib/os-store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Personal OS" },
      {
        name: "description",
        content:
          "A second brain: block-based writing, linked pages, collections and AI reading of everything you think.",
      },
      { property: "og:title", content: "Notes — Personal OS" },
      { property: "og:description", content: "Block-based thinking space inside your Personal OS." },
    ],
  }),
  component: NotesPage,
});

const blockTypes: { type: Block["type"]; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "h2", label: "Heading" },
  { type: "todo", label: "To-do" },
  { type: "callout", label: "Callout" },
  { type: "quote", label: "Quote" },
  { type: "code", label: "Code" },
];

function BlockView({ docId, block }: { docId: string; block: Block }) {
  const write = (text: string) => actions.writeBlock(docId, block.id, text);
  const base =
    "w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground/60";

  if (block.type === "h1")
    return (
      <input
        value={block.text}
        onChange={(e) => write(e.target.value)}
        placeholder="Untitled"
        className={cn(base, "display-lg mb-2")}
      />
    );
  if (block.type === "h2")
    return (
      <input
        value={block.text}
        onChange={(e) => write(e.target.value)}
        placeholder="Heading"
        className={cn(base, "mt-4 text-base font-semibold tracking-tight")}
      />
    );
  if (block.type === "todo")
    return (
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => actions.toggleBlock(docId, block.id)}
          aria-label="Toggle"
          className={cn(
            "mt-1 grid size-4 shrink-0 place-items-center rounded border transition",
            block.done
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-input text-transparent hover:border-primary",
          )}
        >
          <Check className="size-2.5" />
        </button>
        <input
          value={block.text}
          onChange={(e) => write(e.target.value)}
          placeholder="To-do"
          className={cn(base, "text-[15px] leading-relaxed", block.done && "text-muted-foreground line-through")}
        />
      </div>
    );
  if (block.type === "callout")
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-primary-soft/60 px-3 py-2.5">
        <Sparkles className="mt-1 size-3.5 shrink-0 text-primary" />
        <input
          value={block.text}
          onChange={(e) => write(e.target.value)}
          placeholder="Something worth remembering"
          className={cn(base, "text-sm leading-relaxed")}
        />
      </div>
    );
  if (block.type === "quote")
    return (
      <input
        value={block.text}
        onChange={(e) => write(e.target.value)}
        placeholder="Quote"
        className={cn(base, "border-l-2 border-hairline pl-3 text-[15px] leading-relaxed italic")}
      />
    );
  if (block.type === "code")
    return (
      <input
        value={block.text}
        onChange={(e) => write(e.target.value)}
        placeholder="code"
        className={cn(base, "rounded-lg bg-muted px-3 py-2 font-mono text-[13px]")}
      />
    );
  if (block.type === "divider") return <hr className="border-hairline" />;

  return (
    <input
      value={block.text}
      onChange={(e) => write(e.target.value)}
      placeholder="Write, or press a block below…"
      className={cn(base, "text-[15px] leading-relaxed")}
    />
  );
}

function NotesPage() {
  const os = useOS();
  const [openId, setOpenId] = useState(os.docs[0]?.id ?? "");
  const doc = os.docs.find((d) => d.id === openId) ?? os.docs[0];
  const collections = Array.from(new Set(os.docs.map((d) => d.collection)));

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <aside className="animate-rise space-y-6">
        <div>
          <p className="label-eyebrow">Second brain</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {os.docs.length} pages, {collections.length} collections. You wrote most recently in{" "}
            {os.docs[0]?.collection}.
          </p>
          <button
            onClick={() => {
              const id = actions.add("Untitled");
              setOpenId(id);
              toast.success("Page created");
            }}
            className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-hairline text-sm font-medium transition hover:bg-muted/70"
          >
            <Plus className="size-4" /> New page
          </button>
        </div>

        <div>
          <p className="label-eyebrow">Pinned</p>
          <div className="mt-2 space-y-0.5">
            {os.docs
              .filter((d) => d.pinned)
              .map((d) => (
                <button
                  key={d.id}
                  onClick={() => setOpenId(d.id)}
                  className={cn(
                    "row-quiet flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                    d.id === doc?.id && "bg-muted/60",
                  )}
                >
                  <span className="text-muted-foreground">{d.glyph}</span>
                  <span className="truncate">{d.title}</span>
                </button>
              ))}
          </div>
        </div>

        {collections.map((c) => (
          <div key={c}>
            <p className="label-eyebrow">{c}</p>
            <div className="mt-2 space-y-0.5">
              {os.docs
                .filter((d) => d.collection === c)
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setOpenId(d.id)}
                    className={cn(
                      "row-quiet flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                      d.id === doc?.id ? "bg-muted/60" : "text-muted-foreground",
                    )}
                  >
                    <span>{d.glyph}</span>
                    <span className="truncate">{d.title}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </aside>

      {doc ? (
        <section key={doc.id} className="animate-rise min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {doc.collection} · edited {doc.updated}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => actions.pin(doc.id)}
                aria-label="Pin page"
                className={cn(
                  "grid size-8 place-items-center rounded-md transition hover:bg-muted/70",
                  doc.pinned ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Pin className="size-4" />
              </button>
              <button
                onClick={() => toast.success("AI is reading this page…")}
                className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/70"
              >
                <Sparkles className="size-3.5" /> Summarize
              </button>
            </div>
          </div>

          <div className="mt-5 max-w-3xl space-y-2.5">
            {doc.blocks.map((b) => (
              <BlockView key={b.id} docId={doc.id} block={b} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-1 border-t border-hairline pt-4">
            <span className="label-eyebrow mr-1">Insert</span>
            {blockTypes.map((t) => (
              <button
                key={t.type}
                onClick={() => actions.addBlock(doc.id, t.type)}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-primary-soft hover:text-primary"
              >
                /{t.label.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {doc.tags.length ? (
              <span className="flex flex-wrap gap-1.5">
                {doc.tags.map((t) => (
                  <span key={t} className="rounded-md border border-hairline px-1.5 py-0.5">
                    #{t}
                  </span>
                ))}
              </span>
            ) : null}
            {doc.linked.length ? (
              <span className="flex flex-wrap items-center gap-1.5">
                <Link2 className="size-3" />
                {doc.linked.map((l) => (
                  <span key={l} className="underline decoration-hairline underline-offset-4">
                    {l}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
