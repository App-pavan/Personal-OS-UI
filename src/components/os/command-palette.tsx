import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ClipboardCheck, ListChecks, Loader2 } from "lucide-react";
import { modules } from "@/lib/nav";
import { useTasks } from "@/hooks/use-tasks";
import { useChecklistInstances, useChecklistTemplates } from "@/hooks/use-checklists";

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

/** Spotlight over real backend data only. */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const tasks = useTasks(query.trim() ? { search: query.trim(), perPage: 8 } : { perPage: 8 });
  const templates = useChecklistTemplates();
  const instances = useChecklistInstances();

  const go = (to: "/" | "/tasks" | "/checklists" | "/settings") => {
    onOpenChange(false);
    navigate({ to });
  };

  const q = query.trim().toLowerCase();
  const match = (value: string) => !q || value.toLowerCase().includes(q);
  const loading = tasks.isLoading || templates.isLoading || instances.isLoading;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search tasks, checklists and routines…"
      />
      <CommandList className="max-h-[62vh]">
        <CommandEmpty>
          {loading ? (
            <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Searching…
            </span>
          ) : (
            "Nothing matches that yet."
          )}
        </CommandEmpty>

        <CommandGroup heading="Go to">
          {modules.map((m) => (
            <CommandItem key={m.to} value={`go ${m.label}`} onSelect={() => go(m.to)}>
              <m.icon className="size-4 text-primary" />
              <span>{m.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{m.blurb}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {(tasks.data?.items ?? []).length ? (
          <CommandGroup heading="Tasks">
            {(tasks.data?.items ?? []).slice(0, 6).map((t) => (
              <CommandItem key={t.id} value={`task ${t.title}`} onSelect={() => go("/tasks")}>
                <ListChecks className="size-4 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {(instances.data ?? []).filter((i) => match(i.name)).length ? (
          <CommandGroup heading="Running checklists">
            {(instances.data ?? [])
              .filter((i) => match(i.name))
              .slice(0, 5)
              .map((i) => (
                <CommandItem key={i.id} value={`run ${i.name}`} onSelect={() => go("/checklists")}>
                  <ClipboardCheck className="size-4 text-muted-foreground" />
                  <span className="truncate">{i.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {i.completedCount}/{i.itemCount}
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>
        ) : null}

        {(templates.data ?? []).filter((t) => match(t.name)).length ? (
          <CommandGroup heading="Checklist templates">
            {(templates.data ?? [])
              .filter((t) => match(t.name))
              .slice(0, 5)
              .map((t) => (
                <CommandItem
                  key={t.id}
                  value={`template ${t.name}`}
                  onSelect={() => go("/checklists")}
                >
                  <ClipboardCheck className="size-4 text-muted-foreground" />
                  <span className="truncate">{t.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.itemCount} items</span>
                </CommandItem>
              ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
