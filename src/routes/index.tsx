import { createFileRoute } from "@tanstack/react-router";
import { CommandCenterPage } from "@/features/dashboard/components/command-center-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Home — Personal OS" }],
  }),
  component: CommandCenterPage,
});
