import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { PortalStub } from "@/components/portal/PortalStub";

export const Route = createFileRoute("/portal/assistant")({
  component: () => (
    <PortalStub
      icon={Bot}
      eyebrow="AI"
      title="Assistant"
      body="The floating AI assistant is available anywhere in the GIS workspace. A dedicated conversation view — with saved threads and per-Command-Center context — arrives in Sprint 4."
    />
  ),
});