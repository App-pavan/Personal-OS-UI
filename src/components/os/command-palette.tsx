import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  documents,
  familyMembers,
  modules,
  notes,
  projects,
  tasks,
  transactions,
} from "@/lib/os-data";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const items = useMemo(
    () => ({
      tasks: tasks.filter((t) => !t.done).slice(0, 5),
      docs: documents.slice(0, 4),
      projects,
      notes: notes.slice(0, 4),
      money: transactions.slice(0, 4),
      family: familyMembers,
    }),
    [],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tasks, documents, finance, family, anything…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Modules">
          {modules.map((m) => (
            <CommandItem key={m.to} value={`module ${m.label} ${m.blurb}`} onSelect={() => go(m.to)}>
              <m.icon className="size-4 text-primary" />
              <span>{m.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{m.blurb}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {items.tasks.map((t) => (
            <CommandItem key={t.id} value={`task ${t.title}`} onSelect={() => go("/tasks")}>
              <span className="truncate">{t.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{t.due}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Documents">
          {items.docs.map((d) => (
            <CommandItem key={d.id} value={`document ${d.name}`} onSelect={() => go("/documents")}>
              <span className="truncate">{d.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{d.size}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Projects">
          {items.projects.map((p) => (
            <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go("/projects")}>
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.progress}%</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Notes">
          {items.notes.map((n) => (
            <CommandItem key={n.id} value={`note ${n.title}`} onSelect={() => go("/notes")}>
              <span className="truncate">{n.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Finance">
          {items.money.map((t) => (
            <CommandItem key={t.id} value={`transaction ${t.name}`} onSelect={() => go("/finance")}>
              <span>{t.icon}</span>
              <span className="truncate">{t.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                ₹{Math.abs(t.amount).toLocaleString("en-IN")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Family">
          {items.family.map((f) => (
            <CommandItem key={f.id} value={`family ${f.name}`} onSelect={() => go("/family")}>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{f.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
