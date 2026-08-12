import { Link2 } from "lucide-react";
import { GlassInput } from "./glass";

/** Bill metadata only — no upload API in Phase 1. */
export function ReceiptField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Optional receipt reference (URL or storage key). Upload pipeline arrives in a later phase.
      </p>
      <div className="relative">
        <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <GlassInput
          placeholder="Receipt link or reference"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
