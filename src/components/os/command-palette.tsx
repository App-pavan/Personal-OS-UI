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
import { Mic, NotebookPen, Plus, ScanLine, Sparkles, Timer, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  documents,
  familyMembers,
  modules,
  passwords,
  projects,
  rooms,
  transactions,
} from "@/lib/os-data";
import { docs, intents, useOS } from "@/lib/os-store";

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
  const os = useOS();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const actions = useMemo(
    () => [
      {
        label: "Quick note",
        icon: NotebookPen,
        run: () => {
          docs.add("Quick note");
          go("/notes");
        },
      },
      {
        label: "Quick task",
        icon: Plus,
        run: () => {
          intents.add("New intent");
          go("/tasks");
        },
      },
      { label: "Ask AI", icon: Sparkles, run: () => go("/assistant") },
      { label: "Voice capture", icon: Mic, run: () => toast.success("Listening…") },
      { label: "Scan document", icon: ScanLine, run: () => toast.success("Camera ready") },
      { label: "Upload file", icon: Upload, run: () => toast.success("Choose a file") },
      { label: "Start timer", icon: Timer, run: () => toast.success("Timer started") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Ask, search or act — tasks, notes, files, money, devices…" />
      <CommandList className="max-h-[62vh]">
        <CommandEmpty>Nothing matches. Try asking the assistant instead.</CommandEmpty>

        <CommandGroup heading="Actions">
          {actions.map((a) => (
            <CommandItem key={a.label} value={`action ${a.label}`} onSelect={a.run}>
              <a.icon className="size-4 text-primary" />
              <span>{a.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Needs attention">
          {os.intents
            .filter((i) => !i.done)
            .slice(0, 5)
            .map((i) => (
              <CommandItem key={i.id} value={`task ${i.title}`} onSelect={() => go("/tasks")}>
                <span className="truncate">{i.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{i.when}</span>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandGroup heading="Notes">
          {os.docs.slice(0, 5).map((d) => (
            <CommandItem key={d.id} value={`note ${d.title} ${d.tags.join(" ")}`} onSelect={() => go("/notes")}>
              <span className="text-muted-foreground">{d.glyph}</span>
              <span className="truncate">{d.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{d.collection}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Spaces">
          {modules.map((m) => (
            <CommandItem key={m.to} value={`space ${m.label} ${m.blurb}`} onSelect={() => go(m.to)}>
              <m.icon className="size-4 text-muted-foreground" />
              <span>{m.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{m.blurb}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Documents">
          {documents.map((d) => (
            <CommandItem key={d.id} value={`document ${d.name}`} onSelect={() => go("/documents")}>
              <span className="truncate">{d.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{d.size}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go("/projects")}>
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.progress}%</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Money">
          {transactions.slice(0, 5).map((t) => (
            <CommandItem key={t.id} value={`money ${t.name}`} onSelect={() => go("/finance")}>
              <span>{t.icon}</span>
              <span className="truncate">{t.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                ₹{Math.abs(t.amount).toLocaleString("en-IN")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="People">
          {familyMembers.map((f) => (
            <CommandItem key={f.id} value={`person ${f.name}`} onSelect={() => go("/family")}>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{f.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Devices & rooms">
          {rooms.map((r) => (
            <CommandItem key={r.id} value={`room ${r.name}`} onSelect={() => go("/home")}>
              <span className="truncate">{r.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{r.on} on</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Vault">
          {passwords.map((p) => (
            <CommandItem key={p.id} value={`password ${p.name}`} onSelect={() => go("/passwords")}>
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.user}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
