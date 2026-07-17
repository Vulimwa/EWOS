import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/auth/admin")({
  component: () => <AuthCard portalId="admin" />,
});