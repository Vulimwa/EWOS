import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/sdk")({
  component: () => <PortalStub icon={BookOpen} eyebrow="Developer" title="SDK Documentation" body="See docs/sdk.md for defineHazardApp and event bus contracts. Rich in-portal docs coming soon." />,
});