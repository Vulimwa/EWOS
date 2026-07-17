import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";
export const Route = createFileRoute("/developer/api")({
  component: () => <PortalStub icon={Code2} eyebrow="Developer" title="API Explorer" body="Browse EWOS endpoints (OpenAPI at docs/api/openapi.json). Interactive explorer arrives in Sprint 3." />,
});