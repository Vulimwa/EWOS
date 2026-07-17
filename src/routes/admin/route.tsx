import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/ewos/AuthGate";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthGate portal="admin" requireRole="platform_admin">
      <AdminShell />
    </AuthGate>
  ),
});