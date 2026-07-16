import { Link } from "@tanstack/react-router";
import { Building2, Flame, LayoutGrid, LayoutDashboard, Store, Sun, Users, Waves, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRegisteredHazardApps } from "@/sdk";
import { useModuleInstalls } from "@/lib/ewos-queries";

const iconMap: Record<string, LucideIcon> = {
  waves: Waves,
  sun: Sun,
  flame: Flame,
  users: Users,
};

interface LeftNavProps {
  collapsed: boolean;
  orgId: string | undefined;
  orgName: string | undefined;
  activeModule: string | null;
  onSelectModule: (slug: string | null) => void;
}

export function LeftNav({ collapsed, orgId, orgName, activeModule, onSelectModule }: LeftNavProps) {
  const { data: installs } = useModuleInstalls(orgId);
  const registered = getRegisteredHazardApps();

  return (
    <aside
      aria-label="Module navigation"
      className={cn(
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-12" : "w-56",
      )}
    >
      {/* Org switcher (single org in Sprint 1) */}
      <div className={cn("flex items-center gap-2 border-b border-sidebar-border px-3 py-2.5", collapsed && "justify-center px-0")}>
        <Building2 className="size-4 shrink-0 text-primary" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{orgName ?? "Loading…"}</p>
            <p className="text-[10px] text-muted-foreground">Operations workspace</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-1.5">
        {!collapsed && (
          <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
        )}
        <button
          onClick={() => onSelectModule(null)}
          aria-pressed={activeModule === null}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
            activeModule === null
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
          title="Overview"
        >
          <LayoutGrid className="size-4 shrink-0" />
          {!collapsed && <span>Overview</span>}
        </button>
        <Link
          to="/store"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
          title="Capability Store"
        >
          <Store className="size-4 shrink-0" />
          {!collapsed && <span>Capability Store</span>}
        </Link>
        <Link
          to="/portal"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
          title="Organization Portal"
        >
          <LayoutDashboard className="size-4 shrink-0" />
          {!collapsed && <span>Organization Portal</span>}
        </Link>

        {!collapsed && (
          <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            HazardApps
          </p>
        )}
        {installs?.map((install) => {
          const mod = install.modules;
          if (!mod) return null;
          const Icon = iconMap[mod.icon] ?? Waves;
          const isRegistered = registered.some((r) => r.slug === mod.slug);
          const active = activeModule === mod.slug;
          return (
            <button
              key={install.id}
              onClick={() => onSelectModule(active ? null : mod.slug)}
              disabled={!isRegistered}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0",
              )}
              title={mod.name}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">
                  {mod.name}
                  <span className="ml-1.5 text-data text-[9px] text-muted-foreground">v{mod.version}</span>
                </span>
              )}
              {!collapsed && active && <span className="size-1.5 rounded-full bg-primary" aria-hidden />}
            </button>
          );
        })}
        {!collapsed && !installs?.length && (
          <p className="px-2 py-1 text-[11px] text-muted-foreground">No modules installed.</p>
        )}
      </nav>

      {!collapsed && (
        <footer className="border-t border-sidebar-border px-3 py-2">
          <p className="text-data text-[10px] text-muted-foreground">EWOS v0.1.0 · Phase 1 · Sprint 1</p>
        </footer>
      )}
    </aside>
  );
}