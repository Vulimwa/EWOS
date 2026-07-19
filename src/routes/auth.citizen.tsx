import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/auth/citizen")({
  component: () => <AuthCard portalId="citizen" />,
});