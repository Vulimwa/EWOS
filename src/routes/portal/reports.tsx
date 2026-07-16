import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";

export const Route = createFileRoute("/portal/reports")({
  component: () => (
    <PortalStub
      icon={FileBarChart}
      eyebrow="Deliverables"
      title="Reports"
      body="Daily, weekly and monthly situation reports, risk summaries, and AI-generated briefs. PDF/Excel export ships alongside AI Act mode in Sprint 4."
    />
  ),
});