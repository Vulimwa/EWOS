import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/auth/developer")({
  component: () => <AuthCard portalId="developer" />,
});