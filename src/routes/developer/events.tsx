import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/developer/events")({ component: EventRegistry });

function EventRegistry() {
  const { data: modules } = useQuery({
    queryKey: ["event-registry"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("slug,name,event_topics");
      if (error) throw error;
      return data;
    },
  });
  const topics = new Map<string, string[]>();
  for (const m of modules ?? []) {
    for (const t of (m.event_topics as string[] | null) ?? []) {
      const arr = topics.get(t) ?? [];
      arr.push(m.name);
      topics.set(t, arr);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Event Registry</h1>
        <p className="mt-1 text-sm text-muted-foreground">All topics published on the EWOS event bus and the modules that emit them.</p>
      </header>
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{topics.size} topics</h2>
          <Radio className="size-4 text-primary" />
        </header>
        <ul className="divide-y divide-border">
          {[...topics.entries()].map(([topic, mods]) => (
            <li key={topic} className="px-4 py-3 text-sm">
              <p className="text-data font-medium">{topic}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Emitted by: {mods.join(", ")}</p>
            </li>
          ))}
          {!topics.size && <li className="px-4 py-8 text-center text-xs text-muted-foreground">No topics registered yet.</li>}
        </ul>
      </section>
    </div>
  );
}