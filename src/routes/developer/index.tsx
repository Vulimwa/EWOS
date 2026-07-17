import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Boxes, Download, Star, Sparkles } from "lucide-react";

export const Route = createFileRoute("/developer/")({
  component: DeveloperDashboard,
});

function DeveloperDashboard() {
  const { user } = useAuth();
  const { data: modules } = useQuery({
    queryKey: ["dev-modules", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("publisher_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const kpis = [
    { label: "Published plugins", value: modules?.length ?? 0, icon: Boxes },
    { label: "Total installs", value: 0, icon: Download },
    { label: "Avg rating", value: "—", icon: Star },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Build HazardApps</h1>
        <p className="mt-1 text-sm text-muted-foreground">Publish reusable environmental capabilities to the EWOS marketplace.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <Icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Your plugins</h2>
          <Sparkles className="size-4 text-primary" />
        </header>
        <ul className="divide-y divide-border">
          {(modules ?? []).map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  v{m.version} · {m.status} · {m.slug}
                </p>
              </div>
            </li>
          ))}
          {!(modules ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              You haven't published any plugins yet. The Plugin Builder is coming in Sprint 3.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}