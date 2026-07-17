import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Flame, ShieldCheck, Sun, Users, Waves, type LucideIcon } from "lucide-react";
import { useModuleInstalls, useModulesCatalog, useOrg } from "@/lib/ewos-queries";
import { AuthGate } from "@/components/ewos/AuthGate";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Capability Store — EWOS" },
      { name: "description", content: "Install plug-and-play HazardApps: flood, drought, wildfire and community reporting modules for the EWOS early-warning workspace." },
      { property: "og:title", content: "Capability Store — EWOS" },
      { property: "og:description", content: "Plug-and-play hazard modules for the EWOS early-warning workspace." },
    ],
  }),
  component: () => (
    <AuthGate>
      <StorePage />
    </AuthGate>
  ),
});

const iconMap: Record<string, LucideIcon> = { waves: Waves, sun: Sun, flame: Flame, users: Users };

function StorePage() {
  const { data: org } = useOrg();
  const { data: modules, isLoading } = useModulesCatalog();
  const { data: installs } = useModuleInstalls(org?.id);
  const installedIds = new Set(installs?.map((i) => i.module_id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            to="/store"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Workspace
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Capability Store</h1>
          <span className="text-data ml-auto text-[10px] text-muted-foreground">{modules?.length ?? 0} modules</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          HazardApps plug into the shared EWOS infrastructure — GIS, event bus, notifications and the AI assistant.
          Installation management (org-admin gated) arrives in Sprint 2.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {isLoading && <p className="text-xs text-muted-foreground">Loading catalog…</p>}
          {modules?.map((mod) => {
            const Icon = iconMap[mod.icon] ?? Waves;
            const installed = installedIds.has(mod.id);
            const permissions = (mod.permissions as string[] | null) ?? [];
            return (
              <article key={mod.id} className="panel-elevated rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold">{mod.name}</h2>
                      <span className="text-data text-[10px] text-muted-foreground">v{mod.version}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {mod.publisher} · {mod.category}
                    </p>
                  </div>
                  {installed ? (
                    <span className="flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      <Check className="size-3" /> Installed
                    </span>
                  ) : (
                    <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Sprint 2+
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{mod.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  {permissions.map((p) => (
                    <span key={p} className="text-data rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] text-secondary-foreground">
                      {p}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground">
                    <ShieldCheck className="size-3" /> {mod.privacy_classification}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}