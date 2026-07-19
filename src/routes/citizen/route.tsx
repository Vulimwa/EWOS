import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/ewos/AuthGate";
import { CitizenShell } from "@/components/citizen/CitizenShell";

export const Route = createFileRoute("/citizen")({
  component: () => (
    <AuthGate portal="citizen">
      <CitizenShell />
    </AuthGate>
  ),
});