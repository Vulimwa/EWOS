import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { EwosSeverity } from "@/sdk";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";

export const Route = createFileRoute("/developer/analytics")({ component: DevAnalytics });

function DevAnalytics() {
  const { user } = useAuth();

  const { data: myModules } = useQuery({
    queryKey: ["dev-analytics-modules", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("id,slug,name,status,event_topics").eq("publisher_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const m of myModules ?? []) for (const t of (m.event_topics as string[] | null) ?? []) set.add(t);
    return [...set];
  }, [myModules]);

  const moduleIds = (myModules ?? []).map((m) => m.id);
  const { data: installs } = useQuery({
    queryKey: ["dev-analytics-installs", moduleIds.sort().join(",")],
    enabled: moduleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("module_installs").select("module_id").in("module_id", moduleIds);
      if (error) throw error;
      return data;
    },
  });
  const installsByModule = new Map<string, number>();
  for (const i of installs ?? []) installsByModule.set(i.module_id, (installsByModule.get(i.module_id) ?? 0) + 1);

  const { data: events } = useQuery({
    queryKey: ["dev-analytics-events", topics.sort().join(",")],
    enabled: topics.length > 0,
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("topic, severity, occurred_at, source_module")
        .in("topic", topics)
        .gte("occurred_at", since)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const bySeverity: Record<EwosSeverity, number> = { advisory: 0, watch: 0, warning: 0, emergency: 0 };
    const byTopic = new Map<string, number>();
    const byDay = new Map<string, number>();
    for (const e of events ?? []) {
      bySeverity[e.severity as EwosSeverity] = (bySeverity[e.severity as EwosSeverity] ?? 0) + 1;
      byTopic.set(e.topic, (byTopic.get(e.topic) ?? 0) + 1);
      const day = new Date(e.occurred_at).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    const totalInstalls = installs?.length ?? 0;
    const days = [...byDay.entries()].sort();
    const peak = Math.max(1, ...days.map(([, n]) => n));
    return { bySeverity, byTopic: [...byTopic.entries()].sort((a, b) => b[1] - a[1]), days, peak, totalInstalls, totalEvents: events?.length ?? 0 };
  }, [events, installs]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BarChart3 className="size-5 text-primary" /> Plugin Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 7 days across events published under topics you own.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="My plugins" value={myModules?.length ?? 0} />
        <Kpi label="Installs" value={stats.totalInstalls} />
        <Kpi label="Events 7d" value={stats.totalEvents} />
        <Kpi label="Topics" value={topics.length} />
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Severity mix</h2>
        <div className="space-y-2">
          {(["emergency", "warning", "watch", "advisory"] as EwosSeverity[]).map((s) => {
            const n = stats.bySeverity[s];
            const pct = stats.totalEvents ? Math.round((n / stats.totalEvents) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-3 text-xs">
                <SeverityBadge severity={s} />
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-secondary">
                  <div className="h-full bg-primary/70" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right tabular-nums text-muted-foreground">{n} · {pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Daily volume</h2>
          <div className="flex h-32 items-end gap-1">
            {stats.days.map(([day, n]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-sm bg-primary/60" style={{ height: `${(n / stats.peak) * 100}%` }} title={`${day}: ${n}`} />
                <span className="text-[9px] text-muted-foreground">{day.slice(5)}</span>
              </div>
            ))}
            {!stats.days.length && <p className="w-full text-center text-xs text-muted-foreground">No events in window.</p>}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Top topics</h2>
          <ul className="space-y-1.5 text-xs">
            {stats.byTopic.slice(0, 8).map(([t, n]) => (
              <li key={t} className="flex items-center justify-between gap-3 font-mono">
                <span className="truncate text-data">{t}</span>
                <span className="tabular-nums text-muted-foreground">{n}</span>
              </li>
            ))}
            {!stats.byTopic.length && <li className="text-muted-foreground">No topic activity.</li>}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">Your plugins</header>
        <ul className="divide-y divide-border">
          {(myModules ?? []).map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.slug} · {m.status}</p>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{installsByModule.get(m.id) ?? 0} installs</span>
            </li>
          ))}
          {!(myModules ?? []).length && <li className="px-4 py-8 text-center text-xs text-muted-foreground">No plugins yet. Create one in the Plugin Builder.</li>}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}