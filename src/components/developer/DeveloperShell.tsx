import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, Code2, BookOpen, Radio, FlaskConical, Store, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/ewos/TopBar";

interface NavItem { to: string; label: string; icon: LucideIcon }
const NAV: NavItem[] = [
  { to: "/developer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/developer/plugins", label: "Plugin Builder", icon: Boxes },
  { to: "/developer/sdk", label: "SDK Docs", icon: BookOpen },
  { to: "/developer/api", label: "API Explorer", icon: Code2 },
  { to: "/developer/events", label: "Event Registry", icon: Radio },
  { to: "/developer/sandbox", label: "Sandbox", icon: FlaskConical },
  { to: "/developer/marketplace", label: "Marketplace", icon: Store },
  { to: "/developer/analytics", label: "Analytics", icon: BarChart3 },
];

export function DeveloperShell() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar orgName="Developer" onToggleNav={() => {}} searchInputId="dev-search" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Developer Portal</p>
            <p className="mt-0.5 truncate text-sm font-semibold">HazardApp SDK</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {NAV.map((item) => {
              const active = item.to === "/developer" ? pathname === "/developer" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}>
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3 text-[10px] text-muted-foreground">EWOS · developer</div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}