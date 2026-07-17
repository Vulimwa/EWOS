import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Radar, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PORTALS, type PortalId } from "@/lib/portals";

interface AuthCardProps {
  portalId: PortalId;
}

export function AuthCard({ portalId }: AuthCardProps) {
  const portal = PORTALS[portalId];
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && session) {
    void navigate({ to: portal.home });
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!portal.allowSignup) throw new Error("Sign-up is invite-only for this portal.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${portal.home}`,
            data: { intended_portal: portalId },
          },
        });
        if (error) throw error;
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
      void navigate({ to: portal.home });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}${portal.home}`,
        extraParams: { intended_portal: portalId },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  const Icon = portal.icon;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Toaster theme="dark" />
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> All portals
        </Link>
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radar className="size-4" />
          </span>
          <span className="text-data text-sm font-semibold tracking-widest text-foreground">EWOS</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Icon className="size-4 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {portal.name}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{portal.tagline}</p>

          <Button onClick={google} disabled={busy} variant="outline" className="mt-5 w-full">
            Continue with Google
          </Button>

          <div className="my-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {portal.allowSignup ? (
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          ) : (
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Platform Admin is invite-only. Contact the EWOS team for access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}