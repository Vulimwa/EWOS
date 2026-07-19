import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";

export const Route = createFileRoute("/citizen/alerts")({
  component: CitizenAlerts,
});

function CitizenAlerts() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["citizen-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Active alerts</h1>
      </header>
      <section className="rounded-lg border border-border bg-card">
        {isLoading && <p className="p-6 text-xs text-muted-foreground">Loading…</p>}
        <ul className="divide-y divide-border">
          {(events ?? []).map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3 text-sm">
              <SeverityBadge severity={e.severity ?? "advisory"} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.topic}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </p>
                {e.payload && typeof e.payload === "object" && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted/40 p-2 text-[10px] text-muted-foreground">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                )}
              </div>
            </li>
          ))}
          {!isLoading && !(events ?? []).length && (
            <li className="px-4 py-10 text-center text-xs text-muted-foreground">No alerts yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}