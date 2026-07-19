import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/citizen/notifications")({
  component: CitizenNotifications,
});

function CitizenNotifications() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["citizen-notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">My notifications</h1>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {(data ?? []).map((n) => (
          <li key={n.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{n.title ?? n.channel}</p>
            <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
          </li>
        ))}
        {!(data ?? []).length && (
          <li className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications yet.</li>
        )}
      </ul>
    </div>
  );
}