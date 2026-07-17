import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/admin/users")({
  component: () => <PortalStub icon={Users} eyebrow="Admin" title="Users" body="Manage all platform users across every organization." />,
});