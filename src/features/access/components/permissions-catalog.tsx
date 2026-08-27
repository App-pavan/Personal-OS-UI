import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { buildPermissionTree, actionLabel } from "@/features/access/lib/permission-tree";
import { usePermissionCatalog } from "@/hooks/use-rbac";
export function PermissionsCatalog() {
  const catalog = usePermissionCatalog();
  const [search, setSearch] = useState("");

  const tree = useMemo(() => {
    const base = buildPermissionTree(catalog.data ?? []);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base
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
  }, [catalog.data, search]);

  if (catalog.isError) {
    return <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />;
  }
  if (catalog.isLoading) return <RowsSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Read-only catalog of platform permissions. Assign these through roles — permissions cannot
        be created from the UI.
      </p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search permissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="space-y-2">
        {tree.map((mod) => (
          <Collapsible key={mod.key} defaultOpen className="rounded-lg border border-hairline">
            <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left">
              <ChevronDown className="size-4 shrink-0" />
              <span className="text-sm font-medium">{mod.label}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-hairline px-4 pb-4">
              {mod.features.map((feat) => (
                <div key={feat.key} className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {feat.label}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {feat.actions.map((action) => (
                      <li key={action.key} className="rounded-md bg-muted/20 px-3 py-2">
                        <p className="text-sm">{action.description}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {action.key} · {actionLabel(action.action)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
