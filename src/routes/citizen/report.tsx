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

export const Route = createFileRoute("/citizen/report")({
  component: ReportPage,
});

const CATEGORIES = ["flood", "fire", "landslide", "drought", "storm", "infrastructure", "other"];
const SEVERITIES = ["minor", "moderate", "severe", "critical"];

function ReportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "flood",
    severity: "moderate",
    location_name: "",
    contact: "",
  });

  const { data: myReports } = useQuery({
    queryKey: ["my-reports", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("citizen_reports")
        .select("*")
        .eq("reporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("citizen_reports").insert({
        reporter_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        severity: form.severity,
        location_name: form.location_name || null,
        contact: form.contact || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted");
      setForm({ ...form, title: "", description: "", location_name: "" });
      void qc.invalidateQueries({ queryKey: ["my-reports"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Toaster theme="dark" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen Portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Report a hazard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your report is sent directly to responders in the Demo Org.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-1">
          <Label htmlFor="t" className="text-xs">Title</Label>
          <Input id="t" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Flooded road at market" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Severity</Label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
              {SEVERITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="loc" className="text-xs">Location</Label>
          <Input id="loc" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} placeholder="Nearest landmark / address" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="d" className="text-xs">Description</Label>
          <Textarea id="d" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c" className="text-xs">Contact (optional)</Label>
          <Input id="c" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" />
        </div>
        <Button type="submit" disabled={submit.isPending}>{submit.isPending ? "Submitting…" : "Submit report"}</Button>
      </form>

      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">Your submissions</header>
        <ul className="divide-y divide-border">
          {(myReports ?? []).map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.category} · {r.severity} · {r.status} · {new Date(r.created_at).toLocaleString()}</p>
            </li>
          ))}
          {!(myReports ?? []).length && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">No reports yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}