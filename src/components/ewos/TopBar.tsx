import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, PanelLeft, Radar, Search, Store, UserCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/ewos-queries";

interface TopBarProps {
  orgName: string | undefined;
  orgId: string | undefined;
  onToggleNav: () => void;
  searchInputId: string;
}

export function TopBar({ orgName, orgId, onToggleNav, searchInputId }: TopBarProps) {
  const { data: notifications } = useNotifications(orgId);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-2">
      <button
        onClick={onToggleNav}
        aria-label="Toggle navigation ( [ )"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <PanelLeft className="size-4" />
      </button>

      <div className="flex items-center gap-2 pr-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Radar className="size-3.5" />
        </span>
        <span className="text-data text-[13px] font-semibold tracking-widest text-foreground">EWOS</span>
        <span className="hidden rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground md:block">
          {orgName ?? "…"}
        </span>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            id={searchInputId}
            type="search"
            placeholder="Search modules, events, places…"
            aria-label="Global search"
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-12 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-secondary px-1 py-px text-data text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <nav className="ml-auto flex items-center gap-1">
        <Link
          to="/store"
          className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <Store className="size-4" />
          <span className="hidden lg:inline">Capability Store</span>
        </Link>

        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <Bell className="size-4" />
            {!!notifications?.length && (
              <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-severity-warning text-[9px] font-bold text-primary-foreground">
                {notifications.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              role="menu"
              className="overlay-elevated absolute right-0 top-10 w-80 rounded-lg p-1"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Notifications
              </p>
              {notifications?.length ? (
                notifications.map((n) => (
                  <div key={n.id} className="rounded-md px-2 py-1.5 hover:bg-accent/50">
                    <p className="text-xs font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-data text-[10px] text-muted-foreground">
                      {n.channel} · {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground">No notifications yet.</p>
              )}
            </div>
          )}
        </div>

        <button
          aria-label="User menu (sign-in arrives in Sprint 2)"
          className={cn(
            "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
          )}
          title="Sign-in arrives in Sprint 2"
        >
          <UserCircle2 className="size-5" />
        </button>
      </nav>
    </header>
  );
}