import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { RuntimeActivityPage } from "@/features/runtime/components/runtime-activity-page";
import { PERM } from "@/lib/permissions";

const activitySearchSchema = z.object({
  service: z.string().optional(),
  provider: z.string().optional(),
  operation: z.string().optional(),
  correlationId: z.string().optional(),
  level: z.enum(["all", "DEBUG", "INFO", "WARN", "ERROR"]).optional(),
  status: z.enum(["all", "RUNNING", "COMPLETED", "FAILED"]).optional(),
  minutes: z.coerce
    .number()
    .pipe(z.union([z.literal(5), z.literal(10), z.literal(15)]))
    .optional(),
  q: z.string().optional(),
  eventId: z.string().optional(),
});

export const Route = createFileRoute("/system/activity")({
  beforeLoad: requirePermissions(PERM.SYSTEM_RUNTIME_VIEW),
  validateSearch: (search) => activitySearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Runtime Activity — Personal OS" },
      {
        name: "description",
        content: "Live operational activity across your Personal OS for the last 15 minutes.",
      },
    ],
  }),
  component: ActivityRoutePage,
});

function ActivityRoutePage() {
  const search = Route.useSearch();
  return <RuntimeActivityPage search={search} routePath="/system/activity" />;
}
