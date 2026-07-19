import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/admin/marketplace")({ component: Moderation });

function Moderation() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("modules").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); void qc.invalidateQueries({ queryKey: ["admin-modules"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <Toaster theme="dark" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Platform Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Marketplace Moderation</h1>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {(data ?? []).map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{m.name} <span className="text-xs text-muted-foreground">v{m.version}</span></p>
              <p className="truncate text-xs text-muted-foreground">{m.publisher} · {m.category} · {m.status}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: m.id, status: "approved" })}>Approve</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: m.id, status: "rejected" })}>Reject</Button>
          </li>
        ))}
        {!(data ?? []).length && <li className="px-4 py-8 text-center text-xs text-muted-foreground">No modules yet.</li>}
      </ul>
    </div>
  );
}