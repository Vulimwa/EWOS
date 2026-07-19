import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

function UsersAdmin() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,display_name,intended_portal,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Platform Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Users</h1>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {(data ?? []).map((u) => (
          <li key={u.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{u.display_name ?? u.id}</p>
            <p className="text-xs text-muted-foreground">Portal: {u.intended_portal ?? "—"} · joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</p>
          </li>
        ))}
        {!(data ?? []).length && <li className="px-4 py-8 text-center text-xs text-muted-foreground">No users found.</li>}
      </ul>
    </div>
  );
}