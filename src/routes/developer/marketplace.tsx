import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/marketplace")({
  component: () => <PortalStub icon={Store} eyebrow="Developer" title="Marketplace" body="Publish, update, and archive your listings." />,
});