import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/auth/organization")({
  component: () => <AuthCard portalId="organization" />,
});