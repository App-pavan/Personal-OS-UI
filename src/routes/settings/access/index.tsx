import { createFileRoute } from "@tanstack/react-router";
import { AccessSummary } from "@/features/access/components/access-summary";

export const Route = createFileRoute("/settings/access/")({
  component: AccessOverviewPage,
});

function AccessOverviewPage() {
  return (
    <div className="space-y-6">
      <AccessSummary />
      <p className="text-sm text-muted-foreground">
        Use the tabs above to manage users, roles, and inspect the permission catalog.
      </p>
    </div>
  );
}
