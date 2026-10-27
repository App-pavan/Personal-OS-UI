import { SemanticBadge } from "@/components/future";
import type { MaintenanceStatus } from "@/lib/api/vehicle-types";

const labels: Record<MaintenanceStatus, string> = {
  ok: "Up to date",
  due_soon: "Service due soon",
  overdue: "Service overdue",
  unknown: "No schedule",
};

const tones: Record<MaintenanceStatus, "success" | "warning" | "danger" | "muted"> = {
  ok: "success",
  due_soon: "warning",
  overdue: "danger",
  unknown: "muted",
};

export function MaintenanceBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <SemanticBadge tone={tones[status]} dot>
      {labels[status]}
    </SemanticBadge>
  );
}
