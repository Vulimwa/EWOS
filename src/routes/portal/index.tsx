import { createFileRoute, Link } from "@tanstack/react-router";
import { Siren, Boxes, Network, Package, BellRing, Activity, Sparkles } from "lucide-react";
import { useOrg, useEvents, useModuleInstalls, useNotifications } from "@/lib/ewos-queries";
import { useCommandCenters, useIncidents, useAssets } from "@/lib/portal-queries";
import { SeverityBadge } from "@/components/ewos/SeverityBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const { data: org } = useOrg();
  const { data: events } = useEvents(org?.id);
  const { data: installs } = useModuleInstalls(org?.id);
  const { data: notifs } = useNotifications(org?.id);
  const { data: centers } = useCommandCenters(org?.id);
  const { data: incidents } = useIncidents(org?.id);
  const { data: assets } = useAssets(org?.id);

  const activeHazards = (events ?? []).filter((e) =>
    ["warning", "emergency", "watch"].includes(e.severity ?? ""),
  ).length;
  const openIncidents = (incidents ?? []).filter((i) => i.status === "open").length;

  const kpis = [
    { label: "Active hazards", value: activeHazards, icon: Activity, tone: "text-severity-warning" },
    { label: "Open incidents", value: openIncidents, icon: Siren, tone: "text-severity-emergency" },
    { label: "Command Centers", value: centers?.length ?? 0, icon: Network, tone: "text-primary" },
    { label: "Installed apps", value: installs?.length ?? 0, icon: Package, tone: "text-primary" },
    { label: "Assets tracked", value: assets?.length ?? 0, icon: Boxes, tone: "text-muted-foreground" },
    { label: "Notifications", value: notifs?.length ?? 0, icon: BellRing, tone: "text-muted-foreground" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Organization Portal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Operations Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live picture of hazards, capabilities, and response across {org?.name ?? "your organization"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/portal/incidents"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            New incident
          </Link>
          <Link
            to="/store"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Install capability
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </p>
                <Icon className={cn("size-4", k.tone)} />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Active hazards</h2>
            <Link to="/workspace" className="text-xs text-primary hover:underline">
              Open GIS workspace →
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(events ?? []).slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <SeverityBadge severity={e.severity as never} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.topic}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.source_module} · {new Date(e.occurred_at ?? e.created_at ?? "").toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {!(events ?? []).length && (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">
                No hazards published yet. Run a scan from the GIS workspace or install a HazardApp.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Command Centers</h2>
            <Link to="/portal/hierarchy" className="text-xs text-primary hover:underline">
              Manage →
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(centers ?? []).slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <Network className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.description ?? c.slug}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Recent incidents</h2>
            <Link to="/portal/incidents" className="text-xs text-primary hover:underline">
              All incidents →
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(incidents ?? []).slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <SeverityBadge severity={i.severity as never} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{i.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {i.status} · {new Date(i.opened_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {!(incidents ?? []).length && (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">
                No incidents recorded yet.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">AI insights</h2>
            <Sparkles className="size-4 text-primary" />
          </header>
          <div className="p-4 text-xs text-muted-foreground">
            <p>
              {activeHazards > 0
                ? `${activeHazards} active hazard${activeHazards === 1 ? "" : "s"} across your workspace. Prioritise ${(events ?? [])[0]?.topic ?? "the most recent alert"}.`
                : "No active hazards. Consider running a routine risk scan from the GIS workspace."}
            </p>
            <Link
              to="/workspace"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ask the assistant →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}