import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/admin/infrastructure")({
  component: () => <PortalStub icon={Server} eyebrow="Admin" title="Infrastructure" body="Server health, API monitoring, and logs." />,
});