import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth" });
    }
  }, [loading, session, navigate]);

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
  return <>{children}</>;
}