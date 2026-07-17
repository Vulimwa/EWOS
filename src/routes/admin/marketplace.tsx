import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/admin/marketplace")({
  component: () => <PortalStub icon={Store} eyebrow="Admin" title="Marketplace Moderation" body="Approve or reject submitted HazardApps." />,
});