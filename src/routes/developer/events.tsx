import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Radio, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import floodSchema from "../../events/schemas/flood-alert-issued.schema.json";
import vegSchema from "../../events/schemas/vegetation-stress-high.schema.json";

export const Route = createFileRoute("/developer/events")({ component: EventRegistry });

const SCHEMAS: Record<string, unknown> = {
  FloodAlertIssued: floodSchema,
  VegetationStressHigh: vegSchema,
};

function EventRegistry() {
  const { data: modules } = useQuery({
    queryKey: ["event-registry-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("slug,name,event_topics,status");
      if (error) throw error;
      return data;
    },
  });
  const { data: recent } = useQuery({
    queryKey: ["event-registry-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("topic, severity, occurred_at, source_module")
        .order("occurred_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const registry = useMemo(() => {
    const byTopic = new Map<string, { publishers: Set<string>; count: number; lastSeen?: string }>();
    for (const m of modules ?? []) {
      for (const t of (m.event_topics as string[] | null) ?? []) {
        const entry = byTopic.get(t) ?? { publishers: new Set(), count: 0 };
        entry.publishers.add(m.name);
        byTopic.set(t, entry);
      }
    }
    for (const e of recent ?? []) {
      const entry = byTopic.get(e.topic) ?? { publishers: new Set(), count: 0 };
      entry.count += 1;
      if (!entry.lastSeen || e.occurred_at > entry.lastSeen) entry.lastSeen = e.occurred_at;
      byTopic.set(e.topic, entry);
    }
    return [...byTopic.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [modules, recent]);

  const [openTopic, setOpenTopic] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Radio className="size-5 text-primary" /> Event Registry
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Topics on the EWOS event bus, their publishers, live throughput, and JSON schema.</p>
      </header>
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{registry.length} topics</h2>
          <span className="text-xs text-muted-foreground">{recent?.length ?? 0} events (last 200)</span>
        </header>
        <ul className="divide-y divide-border">
          {registry.map(([topic, entry]) => {
            const schema = SCHEMAS[topic];
            const open = openTopic === topic;
            return (
              <li key={topic}>
                <button onClick={() => setOpenTopic(open ? null : topic)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40">
                  <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-data">{topic}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Publishers: {[...entry.publishers].join(", ") || "—"}
                      {entry.lastSeen && <> · last seen {new Date(entry.lastSeen).toLocaleString()}</>}
                    </p>
                  </div>
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">{entry.count}</span>
                </button>
                {open && (
                  <div className="border-t border-border bg-background/40 px-11 py-3">
                    {schema ? (
                      <pre className="overflow-x-auto rounded-md bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                        {JSON.stringify(schema, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No JSON schema registered under <code>src/events/schemas/</code> yet.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {!registry.length && <li className="px-4 py-8 text-center text-xs text-muted-foreground">No topics registered yet.</li>}
        </ul>
      </section>
    </div>
  );
}