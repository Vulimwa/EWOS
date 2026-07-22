import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { FlaskConical, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/sdk/event-bus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";
import type { EwosSeverity } from "@/sdk";

export const Route = createFileRoute("/developer/sandbox")({ component: Sandbox });

const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";
const SEVERITIES: EwosSeverity[] = ["advisory", "watch", "warning", "emergency"];

const SAMPLE_PAYLOAD = {
  gauge_id: "00000000-0000-4000-8000-000000000010",
  gauge_name: "Nzoia @ Rwambwa",
  river: "Nzoia",
  level_m: 5.4,
  warning_level_m: 5.0,
  danger_level_m: 6.0,
  trend: "rising",
  affected_population_estimate: 12000,
  recommended_actions: ["Prepare evacuation centres", "Broadcast SMS alert"],
};

function Sandbox() {
  const qc = useQueryClient();
  const [topic, setTopic] = useState("FloodAlertIssued");
  const [severity, setSeverity] = useState<EwosSeverity>("warning");
  const [sourceModule, setSourceModule] = useState("flood-watch");
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));

  const { data: recent } = useQuery({
    queryKey: ["sandbox-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, topic, severity, source_module, occurred_at")
        .eq("org_id", DEMO_ORG_ID)
        .order("occurred_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const publish = useMutation({
    mutationFn: async () => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(payload);
      } catch {
        throw new Error("Payload is not valid JSON");
      }
      await publishEvent({
        org_id: DEMO_ORG_ID,
        topic,
        schema_version: "1.0.0",
        severity,
        payload: parsed,
        source_module: sourceModule,
      });
    },
    onSuccess: () => {
      toast.success(`${topic} published`);
      void qc.invalidateQueries({ queryKey: ["sandbox-events"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Publish failed"),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Toaster theme="dark" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <FlaskConical className="size-5 text-primary" /> Sandbox
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Publish synthetic events to the Demo Org bus and watch them flow into the live workspace.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Source module</Label>
              <Input value={sourceModule} onChange={(e) => setSourceModule(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Severity</Label>
              <div className="flex flex-wrap gap-1.5">
                {SEVERITIES.map((s) => (
                  <button key={s} onClick={() => setSeverity(s)} className="focus:outline-none">
                    <SeverityBadge severity={s} className={severity === s ? "ring-2 ring-primary" : "opacity-60"} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payload (JSON)</Label>
            <Textarea rows={14} value={payload} onChange={(e) => setPayload(e.target.value)}
              className="font-mono text-[11px] leading-relaxed" />
          </div>
          <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
            <Play className="mr-1.5 size-4" />
            {publish.isPending ? "Publishing…" : "Publish event"}
          </Button>
        </div>

        <aside className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">Recent events</header>
          <ul className="divide-y divide-border">
            {(recent ?? []).map((e) => (
              <li key={e.id} className="px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={e.severity as EwosSeverity} />
                  <span className="truncate font-mono text-data">{e.topic}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{e.source_module} · {new Date(e.occurred_at).toLocaleTimeString()}</p>
              </li>
            ))}
            {!(recent ?? []).length && <li className="px-4 py-6 text-center text-[11px] text-muted-foreground">No events yet.</li>}
          </ul>
        </aside>
      </section>
    </div>
  );
}