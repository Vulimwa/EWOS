import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Radar, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMyRoles } from "@/hooks/use-role";
import type { AppRole, PortalId } from "@/lib/portals";
import { PORTALS } from "@/lib/portals";

interface Props {
  children: ReactNode;
  portal?: PortalId; // where to send unauthenticated users
  requireRole?: AppRole; // extra role gate on top of session
}

export function AuthGate({ children, portal = "organization", requireRole }: Props) {
  const { session, loading } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useMyRoles();
  const navigate = useNavigate();
  const authPath = PORTALS[portal].authPath;

  useEffect(() => {
    if (!loading && !session) void navigate({ to: authPath });
  }, [loading, session, navigate, authPath]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <Radar className="size-4 animate-pulse text-primary" />
          Loading workspace…
        </div>
      </div>
    );
  }

  if (requireRole) {
    if (rolesLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            <Radar className="size-4 animate-pulse text-primary" /> Checking access…
          </div>
        </div>
      );
    }
    const has = (roles ?? []).some((r) => r.role === requireRole);
    if (!has) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-sm rounded-lg border border-border bg-card p-6 text-center">
            <Lock className="mx-auto mb-3 size-5 text-primary" />
            <h1 className="text-sm font-semibold">Access required</h1>
            <p className="mt-2 text-xs text-muted-foreground">
              You don't have the {requireRole} role. Ask a platform admin to grant access, or return to
              choose a different portal.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="mt-4 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Back to portals
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}