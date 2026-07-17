import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/ewos/AuthGate";
import { DeveloperShell } from "@/components/developer/DeveloperShell";

export const Route = createFileRoute("/developer")({
  component: () => (
    <AuthGate portal="developer" requireRole="developer">
      <DeveloperShell />
    </AuthGate>
  ),
});