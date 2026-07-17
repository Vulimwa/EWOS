import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { AppRole } from "@/lib/portals";

/** Read the current user's roles across all orgs. */
export function useMyRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, org_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useHasRole(role: AppRole) {
  const { data } = useMyRoles();
  return (data ?? []).some((r) => r.role === role);
}