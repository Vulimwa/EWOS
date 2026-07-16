import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Siren } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/ewos-queries";
import { useIncidents, useCommandCenters } from "@/lib/portal-queries";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/incidents")({
  component: IncidentsPage,
});

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const SEVERITIES = ["advisory", "watch", "warning", "emergency"] as const;
const CATEGORIES = ["flood", "fire", "drought", "storm", "landslide", "health", "general"] as const;

function IncidentsPage() {
  const { data: org } = useOrg();
  const { data: incidents } = useIncidents(org?.id);
  const { data: centers } = useCommandCenters(org?.id);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    severity: "advisory",
    command_center_id: "",
    location_name: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const create = useMutation({
    mutationFn: async () => {
      if (!org || !form.title.trim()) throw new Error("Title required");
      const { error } = await supabase.from("incidents").insert({
        org_id: org.id,
        title: form.title.trim(),
        description: form.description || null,
        category: form.category,
        severity: form.severity,
        command_center_id: form.command_center_id || null,
        location_name: form.location_name || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Incident created");
      setOpen(false);
      setForm({ title: "", description: "", category: "general", severity: "advisory", command_center_id: "", location_name: "" });
      queryClient.invalidateQueries({ queryKey: ["incidents", org?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status === "closed" || status === "resolved") patch.closed_at = new Date().toISOString();
      const { error } = await supabase.from("incidents").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents", org?.id] });
    },
  });

  const filtered = (incidents ?? []).filter(
    (i) => statusFilter === "all" || i.status === statusFilter,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Response</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Incidents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational incidents linked to hazards, assets, and Command Centers.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> New incident
        </button>
      </header>

      {open && (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
                placeholder="e.g. Nzoia river burst — Budalangi"
              />
            </Field>
            <Field label="Command Center">
              <select
                value={form.command_center_id}
                onChange={(e) => setForm({ ...form, command_center_id: e.target.value })}
                className="input"
              >
                <option value="">— Unassigned —</option>
                {(centers ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Severity">
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input">
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className="input" placeholder="Region / ward / place" />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input"
              />
            </Field>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancel</button>
            <button
              onClick={() => create.mutate()}
              disabled={create.isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Create incident
            </button>
          </div>
        </section>
      )}

      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Filter:</span>
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-md border border-border px-2 py-1 capitalize",
              statusFilter === s ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Incident</th>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Command Center</th>
              <th className="px-3 py-2 text-left">Opened</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Siren className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{i.title}</span>
                  </div>
                  {i.location_name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{i.location_name}</p>
                  )}
                </td>
                <td className="px-3 py-2"><SeverityBadge severity={i.severity} /></td>
                <td className="px-3 py-2 text-xs capitalize">{i.category}</td>
                <td className="px-3 py-2 text-xs">{i.command_centers?.name ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(i.opened_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={i.status}
                    onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value })}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-xs text-muted-foreground">
                  No incidents match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}