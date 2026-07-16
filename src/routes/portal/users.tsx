import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";

export const Route = createFileRoute("/portal/users")({
  component: () => (
    <PortalStub
      icon={Users}
      eyebrow="Access"
      title="Users & Roles"
      body="Invite members, group them into departments and teams, and assign role-scoped permissions. Multi-org switcher and invite flows land in Sprint 3."
    />
  ),
});