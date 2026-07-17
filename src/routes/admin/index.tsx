import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: OrgsAdmin,
});

function OrgsAdmin() {
  const { data: orgs } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Platform Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Organizations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Approve, suspend, or remove organizations across the ecosystem.</p>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">All organizations</h2>
          <Building2 className="size-4 text-primary" />
        </header>
        <ul className="divide-y divide-border">
          {(orgs ?? []).map((o) => (
            <li key={o.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{o.name}</p>
                <p className="truncate text-xs text-muted-foreground">{o.slug} · status: {(o as { status?: string }).status ?? "active"}</p>
              </div>
            </li>
          ))}
          {!(orgs ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">No organizations found.</li>
          )}
        </ul>
      </section>
    </div>
  );
}