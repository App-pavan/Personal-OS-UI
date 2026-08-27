import { createFileRoute } from "@tanstack/react-router";
import { AccessRestricted } from "@/features/capabilities/access-restricted";

export const Route = createFileRoute("/access-restricted")({
  head: () => ({ meta: [{ title: "Access restricted — Personal OS" }] }),
  component: AccessRestricted,
});
