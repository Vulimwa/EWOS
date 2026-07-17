import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/events")({
  component: () => <PortalStub icon={Radio} eyebrow="Developer" title="Event Registry" body="Schemas under src/events/schemas/*. UI to subscribe/publish test events is on the roadmap." />,
});