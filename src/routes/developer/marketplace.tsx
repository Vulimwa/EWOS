import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Store, Send, Archive, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/developer/marketplace")({ component: DevMarketplace });

const STATUSES = ["draft", "submitted", "approved", "archived"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<Status, string> = {
  draft: "border-border text-muted-foreground",
  submitted: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  approved: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  archived: "border-rose-500/40 text-rose-400 bg-rose-500/10",
};

function DevMarketplace() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["dev-marketplace", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules").select("*")
        .eq("publisher_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("modules").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Moved to ${status}`);
      void qc.invalidateQueries({ queryKey: ["dev-marketplace"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const counts: Record<Status, number> = { draft: 0, submitted: 0, approved: 0, archived: 0 };
  for (const m of data ?? []) counts[(m.status as Status) ?? "draft"] += 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Toaster theme="dark" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Store className="size-5 text-primary" /> Marketplace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Publish and manage your HazardApps across the review lifecycle.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        {STATUSES.map((k) => (
          <div key={k} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{counts[k]}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">Your listings</header>
        <ul className="divide-y divide-border">
          {(data ?? []).map((m) => {
            const status = (m.status as Status) ?? "draft";
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">v{m.version} · {m.category}</p>
                </div>
                <span className={cn("rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider", STATUS_STYLES[status])}>{status}</span>
                {status === "draft" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: m.id, status: "submitted" })}>
                    <Send className="mr-1 size-3" /> Submit
                  </Button>
                )}
                {status === "submitted" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: m.id, status: "draft" })}>
                    <RotateCcw className="mr-1 size-3" /> Withdraw
                  </Button>
                )}
                {status !== "archived" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: m.id, status: "archived" })}>
                    <Archive className="mr-1 size-3" /> Archive
                  </Button>
                )}
                {status === "archived" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: m.id, status: "draft" })}>
                    <RotateCcw className="mr-1 size-3" /> Restore
                  </Button>
                )}
              </li>
            );
          })}
          {!(data ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              No listings yet — create a draft in the Plugin Builder.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}