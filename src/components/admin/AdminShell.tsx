import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Building2, Store, Users, Bot, Server, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/ewos/TopBar";

interface NavItem { to: string; label: string; icon: LucideIcon }
const NAV: NavItem[] = [
  { to: "/admin", label: "Organizations", icon: Building2 },
  { to: "/admin/marketplace", label: "Marketplace", icon: Store },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/ai", label: "AI Monitoring", icon: Bot },
  { to: "/admin/infrastructure", label: "Infrastructure", icon: Server },
];

export function AdminShell() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar orgName="Platform Admin" onToggleNav={() => {}} searchInputId="admin-search" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Platform Admin</p>
            <p className="mt-0.5 truncate text-sm font-semibold">EWOS Ecosystem</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {NAV.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
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
          <div className="border-t border-sidebar-border p-3 text-[10px] text-muted-foreground">EWOS · admin</div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}