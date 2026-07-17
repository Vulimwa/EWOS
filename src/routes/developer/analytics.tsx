import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/analytics")({
  component: () => <PortalStub icon={BarChart3} eyebrow="Developer" title="Plugin Analytics" body="Usage, performance, and error trends across your published HazardApps." />,
});