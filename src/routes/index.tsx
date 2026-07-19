import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyRoles } from "@/hooks/use-role";
import { PORTAL_LIST, PORTALS, ORG_ROLES, type PortalId } from "@/lib/portals";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/** Landing / portal chooser. Signed-in users can jump straight to a portal they have access to. */
function LandingPage() {
  const { session, loading } = useAuth();
  const { data: roles } = useMyRoles();
  const navigate = useNavigate();

  const rolesSet = new Set((roles ?? []).map((r) => r.role));
  const hasAccess = (id: PortalId) => {
    if (id === "organization") return ORG_ROLES.some((r) => rolesSet.has(r));
    return rolesSet.has(PORTALS[id].role);
  };

  // Auto-redirect: if the user has exactly one accessible portal, take them there.
  useEffect(() => {
    if (!session || !roles) return;
    const accessible = PORTAL_LIST.filter((p) => hasAccess(p.id));
    if (accessible.length === 1) void navigate({ to: accessible[0].home });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, roles]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radar className="size-4" />
          </span>
          <span className="text-data text-sm font-semibold tracking-widest">EWOS</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {loading ? null : session ? (
            <span>Signed in as {session.user.email}</span>
          ) : (
            <span>Early Warning Operating System</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Choose your portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            One platform. Three operating surfaces.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            EWOS is the operating system for environmental intelligence. Organizations run their workspace,
            developers build HazardApps, and platform admins keep the ecosystem healthy.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PORTAL_LIST.map((portal) => {
            const Icon = portal.icon;
            const access = session && hasAccess(portal.id);
            const targetTo = access ? portal.home : portal.authPath;
            return (
              <Link
                key={portal.id}
                to={targetTo}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/60 hover:shadow-[0_0_0_1px_hsl(var(--primary)/.4)]",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 -z-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100",
                    portal.accent,
                  )}
                />
                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-border bg-background/60">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{portal.name}</h2>
                  <p className="mt-1 text-xs font-medium text-primary">{portal.tagline}</p>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{portal.description}</p>
                  <div className="mt-6 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {access ? "Open portal" : session ? "Request access" : "Sign in or sign up"}
                    </span>
                    <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Each portal has its own sign-in flow. Your account can hold access to more than one portal — you'll be able to
          switch from the top bar once inside.
        </p>
      </main>
    </div>
  );
}