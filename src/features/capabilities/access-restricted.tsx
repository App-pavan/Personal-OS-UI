import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";

export function AccessRestricted({
  title = "Access restricted",
  description = "You don't have permission to access this area.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-start gap-4 py-16">
      <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
        <ShieldOff className="size-5" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Link
        to="/"
        className="gradient-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Return to Personal OS
      </Link>
    </div>
  );
}
