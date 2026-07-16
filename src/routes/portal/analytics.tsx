import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";

export const Route = createFileRoute("/portal/analytics")({
  component: () => (
    <PortalStub
      icon={Sparkles}
      eyebrow="Insights"
      title="Analytics"
      body="Risk trends, incident distributions, module usage and response-time KPIs. Wired to the event store once Sprint 3 timeline data lands."
    />
  ),
});