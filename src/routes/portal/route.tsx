import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/ewos/AuthGate";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal")({
  component: () => (
    <AuthGate>
      <PortalShell />
    </AuthGate>
  ),
});