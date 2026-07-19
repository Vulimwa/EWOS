import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/developer/plugins")({
  component: PluginBuilder,
});

const CATEGORIES = ["flood", "drought", "wildfire", "storm", "seismic", "health", "community", "other"];

function PluginBuilder() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    category: "flood",
    version: "0.1.0",
    icon: "waves",
    event_topics: "FloodAlertIssued",
  });

  const { data: modules } = useQuery({
    queryKey: ["my-plugins", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules").select("*")
        .eq("publisher_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const topics = form.event_topics.split(",").map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase.from("modules").insert({
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        version: form.version,
        category: form.category,
        icon: form.icon,
        publisher: user.email ?? "unknown",
        publisher_id: user.id,
        status: "draft",
        event_topics: topics,
        permissions: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plugin draft created");
      setForm({ ...form, slug: "", name: "", description: "" });
      void qc.invalidateQueries({ queryKey: ["my-plugins"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const submit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").update({ status: "submitted" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Submitted for review"); void qc.invalidateQueries({ queryKey: ["my-plugins"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").update({ status: "archived" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["my-plugins"] }); },
  });

  const onSubmit = (e: FormEvent) => { e.preventDefault(); create.mutate(); };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Toaster theme="dark" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Plugin Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Scaffold a new HazardApp draft. Submit for review to publish to the marketplace.</p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <div className="space-y-1"><Label className="text-xs">Slug</Label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-flood-app" /></div>
        <div className="space-y-1"><Label className="text-xs">Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Flood App" /></div>
        <div className="space-y-1"><Label className="text-xs">Version</Label><Input required value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Icon key</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="waves | sun | flame | users" /></div>
        <div className="space-y-1"><Label className="text-xs">Event topics (comma separated)</Label><Input value={form.event_topics} onChange={(e) => setForm({ ...form, event_topics: e.target.value })} /></div>
        <div className="space-y-1 md:col-span-2"><Label className="text-xs">Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="md:col-span-2"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create draft"}</Button></div>
      </form>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">Your plugins</header>
        <ul className="divide-y divide-border">
          {(modules ?? []).map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">v{m.version} · {m.status} · {m.slug}</p>
              </div>
              {m.status === "draft" && <Button size="sm" variant="outline" onClick={() => submit.mutate(m.id)}>Submit</Button>}
              {m.status !== "archived" && <Button size="sm" variant="ghost" onClick={() => archive.mutate(m.id)}>Archive</Button>}
            </li>
          ))}
          {!(modules ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">No plugins yet — create your first draft above.</li>
          )}
        </ul>
      </section>
    </div>
  );
}