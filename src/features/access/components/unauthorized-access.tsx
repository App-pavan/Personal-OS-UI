import { ShieldOff } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function UnauthorizedAccess() {
  return (
    <div className="surface-quiet flex flex-col items-start gap-3 p-8">
      <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
        <ShieldOff className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium">You don&apos;t have permission to manage access</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          Access Control is restricted to administrators. Contact the platform owner if you need
          access changes.
        </p>
      </div>
      <Link
        to="/settings"
        className="mt-1 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium transition hover:bg-muted/70"
      >
        Back to settings
      </Link>
    </div>
  );
}
