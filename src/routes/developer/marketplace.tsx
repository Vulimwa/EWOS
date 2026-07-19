import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/developer/marketplace")({ component: DevMarketplace });

function DevMarketplace() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["dev-marketplace", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").eq("publisher_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
  const grouped = { draft: [] as typeof data, submitted: [] as typeof data, approved: [] as typeof data, archived: [] as typeof data };
  for (const m of data ?? []) {
    const key = (m.status as keyof typeof grouped) ?? "draft";
    (grouped[key] ??= []).push(m);
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Marketplace status</h1>
      </header>
      <div className="grid gap-3 md:grid-cols-4">
        {(["draft", "submitted", "approved", "archived"] as const).map((k) => (
          <div key={k} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{grouped[k]?.length ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}