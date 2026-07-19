import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BellRing, Siren, MessageCircle, ShieldAlert, type LucideIcon } from "lucide-react";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";

export const Route = createFileRoute("/citizen/")({
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const { data: events } = useQuery({
    queryKey: ["citizen-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,topic,severity,payload,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Stay safe, stay informed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live alerts and hazards near you, plus one-tap reporting and AI safety help.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <QuickCard to="/citizen/alerts" icon={BellRing} title="Active alerts" body="See all hazards in your area." />
        <QuickCard to="/citizen/report" icon={Siren} title="Report a hazard" body="Flood, fire, landslide, or unsafe conditions." />
        <QuickCard to="/citizen/assistant" icon={MessageCircle} title="Ask the assistant" body="Get safety guidance in plain language." />
      </section>

      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Latest hazards</h2>
          <ShieldAlert className="size-4 text-primary" />
        </header>
        <ul className="divide-y divide-border">
          {(events ?? []).map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <SeverityBadge severity={e.severity ?? "advisory"} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.topic}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
          {!(events ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">No active hazards right now.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, body }: { to: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <Link to={to} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </Link>
  );
}