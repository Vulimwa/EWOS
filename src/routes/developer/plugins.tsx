import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/plugins")({
  component: () => <PortalStub icon={Boxes} eyebrow="Developer" title="Plugin Builder" body="Scaffold, configure, and publish new HazardApps. Ships in Sprint 3." />,
});