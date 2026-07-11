import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanLine, Waves } from "lucide-react";
import { toast } from "sonner";
import { runFloodRiskScan } from "@/lib/flood.functions";
import { useGaugeReadings, useGauges } from "@/lib/ewos-queries";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";

export function FloodPanel({ orgId }: { orgId: string }) {
  const { data: gauges } = useGauges(orgId);
  const gauge = gauges?.[0];
  const { data: readings } = useGaugeReadings(gauge?.id);
  const scan = useServerFn(runFloodRiskScan);
  const queryClient = useQueryClient();
  const [lastSeverity, setLastSeverity] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => scan({ data: { gaugeId: gauge!.id } }),
    onSuccess: (result) => {
      setLastSeverity(result.severity);
      queryClient.invalidateQueries({ queryKey: ["readings", gauge?.id] });
      queryClient.invalidateQueries({ queryKey: ["events", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
      toast(
        result.eventPublished
          ? `FloodAlertIssued published — ${result.severity.toUpperCase()} at ${result.levelM.toFixed(2)} m`
          : `Risk scan complete — ${result.severity} (${result.levelM.toFixed(2)} m), no alert threshold crossed`,
      );
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Risk scan failed"),
  });

  if (!gauge) return null;

  const latest = readings?.[readings.length - 1];
  const levels = readings?.map((r) => r.level_m) ?? [];
  const max = Math.max(gauge.danger_level_m + 0.5, ...levels);
  const points = levels
    .map((level, i) => `${(i / Math.max(levels.length - 1, 1)) * 100},${36 - (level / max) * 34}`)
    .join(" ");

  return (
    <section
      aria-label="Flood Watch — river gauges"
      className="panel-elevated absolute bottom-4 left-4 z-10 w-72 rounded-lg border border-border"
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Waves className="size-4 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-semibold text-foreground">{gauge.name}</h3>
          <p className="text-[10px] text-muted-foreground">{gauge.river_name} · flood-watch v0.1.0</p>
        </div>
        {lastSeverity && <SeverityBadge severity={lastSeverity} />}
      </header>

      <div className="space-y-2.5 px-3 py-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-data text-2xl font-semibold text-foreground">
            {latest ? latest.level_m.toFixed(2) : "—"}
            <span className="ml-1 text-xs text-muted-foreground">m</span>
          </span>
          <span className="text-right text-[10px] leading-tight text-muted-foreground">
            <span className="block">
              warn <span className="text-data text-severity-warning">{gauge.warning_level_m.toFixed(1)} m</span>
            </span>
            <span className="block">
              danger <span className="text-data text-severity-emergency">{gauge.danger_level_m.toFixed(1)} m</span>
            </span>
          </span>
        </div>

        {levels.length > 1 && (
          <svg viewBox="0 0 100 36" className="h-9 w-full" aria-label="Water level trend" role="img">
            <line x1="0" x2="100" y1={36 - (gauge.warning_level_m / max) * 34} y2={36 - (gauge.warning_level_m / max) * 34} stroke="var(--severity-warning)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" x2="100" y1={36 - (gauge.danger_level_m / max) * 34} y2={36 - (gauge.danger_level_m / max) * 34} stroke="var(--severity-emergency)" strokeWidth="0.5" strokeDasharray="2 2" />
            <polyline points={points} fill="none" stroke="var(--signal)" strokeWidth="1.5" />
          </svg>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <ScanLine className="size-3" />}
          Ingest reading + run risk scan
        </button>
      </div>
    </section>
  );
}