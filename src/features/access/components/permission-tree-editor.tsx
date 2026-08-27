import { useEffect, useMemo, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ChevronDown } from "lucide-react";
import {
  buildPermissionTree,
  modulePermissionKeys,
  type PermissionModule,
} from "@/features/access/lib/permission-tree";
import type { PermissionDefinition } from "@/lib/api/rbac-types";
import { cn } from "@/lib/utils";

type Props = {
  definitions: PermissionDefinition[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  search?: string;
};

export function PermissionTreeEditor({ definitions, value, onChange, disabled, search }: Props) {
  const tree = useMemo(() => buildPermissionTree(definitions), [definitions]);
  const granted = useMemo(() => new Set(value), [value]);

  const filteredTree = useMemo(() => {
    const q = (search ?? "").trim().toLowerCase();
    if (!q) return tree;
    return tree
      .map((mod) => ({
        ...mod,
        features: mod.features
          .map((feat) => ({
            ...feat,
            actions: feat.actions.filter(
              (a) =>
                a.description.toLowerCase().includes(q) ||
                a.key.toLowerCase().includes(q) ||
                mod.label.toLowerCase().includes(q),
            ),
          }))
          .filter((f) => f.actions.length > 0),
      }))
      .filter((m) => m.features.length > 0);
  }, [tree, search]);

  const toggle = (key: string, on: boolean) => {
    const next = new Set(value);
    if (on) next.add(key);
    else next.delete(key);
    onChange([...next]);
  };

  const toggleModule = (mod: PermissionModule, on: boolean) => {
    const keys = modulePermissionKeys(mod);
    const next = new Set(value);
    for (const k of keys) {
      if (on) next.add(k);
      else next.delete(k);
    }
    onChange([...next]);
  };

  const moduleOn = (mod: PermissionModule) => {
    const keys = modulePermissionKeys(mod);
    return keys.some((k) => granted.has(k));
  };

  const moduleFull = (mod: PermissionModule) => {
    const keys = modulePermissionKeys(mod);
    return keys.length > 0 && keys.every((k) => granted.has(k));
  };

  return (
    <div className="space-y-2">
      {filteredTree.map((mod) => (
        <ModuleBlock
          key={mod.key}
          mod={mod}
          granted={granted}
          disabled={Boolean(disabled)}
          moduleOn={moduleOn(mod)}
          moduleFull={moduleFull(mod)}
          onModuleToggle={(on) => toggleModule(mod, on)}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function ModuleBlock({
  mod,
  granted,
  disabled,
  moduleOn,
  moduleFull,
  onModuleToggle,
  onToggle,
}: {
  mod: PermissionModule;
  granted: Set<string>;
  disabled?: boolean;
  moduleOn: boolean;
  moduleFull: boolean;
  onModuleToggle: (on: boolean) => void;
  onToggle: (key: string, on: boolean) => void;
}) {
  const [open, setOpen] = useState(moduleOn);

  useEffect(() => {
    if (moduleOn) setOpen(true);
  }, [moduleOn]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-hairline">
      <div className="flex items-center gap-3 px-4 py-3">
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronDown className={cn("size-4 shrink-0 transition", open && "rotate-180")} />
          <span className="text-sm font-medium">{mod.label}</span>
        </CollapsibleTrigger>
        <Switch
          checked={moduleFull}
          disabled={disabled}
          onCheckedChange={onModuleToggle}
          aria-label={`Toggle ${mod.label} module`}
        />
      </div>
      <CollapsibleContent className="border-t border-hairline px-4 pb-3">
        {mod.features.map((feat) => (
          <div key={feat.key} className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {feat.label}
            </p>
            <ul className="mt-2 space-y-2">
              {feat.actions.map((action) => (
                <li key={action.key} className="flex items-start gap-3">
                  <Checkbox
                    id={action.key}
                    checked={granted.has(action.key)}
                    disabled={disabled}
                    onCheckedChange={(v) => onToggle(action.key, v === true)}
                  />
                  <label htmlFor={action.key} className="min-w-0 flex-1 cursor-pointer">
                    <p className="text-sm">{action.description}</p>
                    <p className="text-[10px] text-muted-foreground">{action.key}</p>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
