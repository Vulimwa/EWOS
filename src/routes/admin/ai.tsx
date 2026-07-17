import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/admin/ai")({
  component: () => <PortalStub icon={Bot} eyebrow="Admin" title="AI Monitoring" body="Prompt management, model usage, cost and safety telemetry." />,
});