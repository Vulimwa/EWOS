import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  Siren,
  Boxes,
  Store,
  Users,
  FileBarChart,
  BellRing,
  Map as MapIcon,
  Bot,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/ewos/TopBar";
import { useOrg } from "@/lib/ewos-queries";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  section: "operate" | "manage" | "extend";
}

const NAV: NavItem[] = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, section: "operate" },
  { to: "/portal/hierarchy", label: "Command Centers", icon: Network, section: "operate" },
  { to: "/portal/incidents", label: "Incidents", icon: Siren, section: "operate" },
  { to: "/portal/assets", label: "Assets", icon: Boxes, section: "operate" },
  { to: "/", label: "GIS Workspace", icon: MapIcon, section: "operate" },
  { to: "/portal/notifications", label: "Notifications", icon: BellRing, section: "manage" },
  { to: "/portal/users", label: "Users & Roles", icon: Users, section: "manage" },
  { to: "/portal/reports", label: "Reports", icon: FileBarChart, section: "manage" },
  { to: "/portal/analytics", label: "Analytics", icon: Sparkles, section: "manage" },
  { to: "/store", label: "Capability Store", icon: Store, section: "extend" },
  { to: "/portal/assistant", label: "AI Assistant", icon: Bot, section: "extend" },
];

export function PortalShell() {
  const { data: org } = useOrg();
  const location = useLocation();
  const pathname = location.pathname;

  const sections: Array<{ key: NavItem["section"]; title: string }> = [
    { key: "operate", title: "Operate" },
    { key: "manage", title: "Manage" },
    { key: "extend", title: "Extend" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar orgName={org?.name} orgId={org?.id} searchInputId="portal-search" />
      <div className="flex min-h-0 flex-1">
        <aside
          aria-label="Portal navigation"
          className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
        >
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Organization Portal
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-sidebar-foreground">
              {org?.name ?? "Loading…"}
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {sections.map((section) => (
              <div key={section.key} className="mb-2">
                <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {section.title}
                </p>
                {NAV.filter((n) => n.section === section.key).map((item) => {
                  const active =
                    item.to === "/portal"
                      ? pathname === "/portal"
                      : pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-3 text-[10px] text-muted-foreground">
            EWOS Platform · v0.2
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}