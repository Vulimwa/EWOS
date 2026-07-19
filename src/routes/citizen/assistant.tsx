import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";

export const Route = createFileRoute("/citizen/assistant")({
  component: () => (
    <PortalStub icon={MessageCircle} eyebrow="Citizen" title="Safety Assistant"
      body="Ask the AI safety assistant about preparedness, evacuation routes, and current hazards. Chat surface arrives with the shared assistant refactor." />
  ),
});