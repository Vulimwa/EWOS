import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/sandbox")({
  component: () => <PortalStub icon={FlaskConical} eyebrow="Developer" title="Sandbox" body="Run a HazardApp against synthetic events before publishing." />,
});