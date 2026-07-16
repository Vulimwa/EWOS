import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Boxes, Hospital, Truck, Flame, Droplet, Radio, CloudSun } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/ewos-queries";
import { useAssets } from "@/lib/portal-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/assets")({
  component: AssetsPage,
});

const TYPES = [
  { key: "hospital", label: "Hospital", icon: Hospital },
  { key: "fire_station", label: "Fire Station", icon: Flame },
  { key: "vehicle", label: "Vehicle", icon: Truck },
  { key: "water_point", label: "Water Point", icon: Droplet },
  { key: "sensor", label: "Sensor", icon: Radio },
  { key: "weather_station", label: "Weather Station", icon: CloudSun },
  { key: "infrastructure", label: "Infrastructure", icon: Boxes },
] as const;

function AssetsPage() {
  const { data: org } = useOrg();
  const { data: assets } = useAssets(org?.id);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", asset_type: "hospital", status: "operational", address: "", capacity: "" });
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const create = useMutation({
    mutationFn: async () => {
      if (!org || !form.name.trim()) throw new Error("Name required");
      const { error } = await supabase.from("assets").insert({
        org_id: org.id,
        name: form.name.trim(),
        asset_type: form.asset_type,
        status: form.status,
        address: form.address || null,
        capacity: form.capacity ? Number(form.capacity) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset added");
      setOpen(false);
      setForm({ name: "", asset_type: "hospital", status: "operational", address: "", capacity: "" });
      queryClient.invalidateQueries({ queryKey: ["assets", org?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  const filtered = (assets ?? []).filter((a) => typeFilter === "all" || a.asset_type === typeFilter);
  const iconFor = (t: string) => TYPES.find((x) => x.key === t)?.icon ?? Boxes;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Infrastructure</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Critical infrastructure and response resources. Appears on the GIS workspace when geo-located.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Add asset
        </button>
      </header>

      {open && (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Kakamega County Referral Hospital" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</span>
              <select value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })} className="input">
                {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option>operational</option>
                <option>degraded</option>
                <option>offline</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Capacity</span>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input" placeholder="e.g. 400 beds" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Address</span>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancel</button>
            <button onClick={() => create.mutate()} disabled={create.isPending} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50">Save asset</button>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Type:</span>
        <button onClick={() => setTypeFilter("all")} className={cn("rounded-md border border-border px-2 py-1", typeFilter === "all" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>All</button>
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setTypeFilter(t.key)} className={cn("rounded-md border border-border px-2 py-1", typeFilter === t.key ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>{t.label}</button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const Icon = iconFor(a.asset_type);
          return (
            <div key={a.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{a.asset_type.replace("_", " ")}</p>
                </div>
                <span className={cn(
                  "rounded-sm border px-1.5 py-px text-[10px] uppercase tracking-wider",
                  a.status === "operational" && "border-severity-advisory/40 bg-severity-advisory/10 text-severity-advisory",
                  a.status === "degraded" && "border-severity-warning/40 bg-severity-warning/10 text-severity-warning",
                  a.status === "offline" && "border-severity-emergency/40 bg-severity-emergency/10 text-severity-emergency",
                )}>{a.status}</span>
              </div>
              {a.address && <p className="mt-2 text-xs text-muted-foreground">{a.address}</p>}
              {a.capacity != null && <p className="mt-1 text-xs text-muted-foreground">Capacity: {a.capacity}</p>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border bg-card p-10 text-center text-xs text-muted-foreground">
            No assets recorded. Add hospitals, sensors, or vehicles to build your operational picture.
          </div>
        )}
      </section>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}