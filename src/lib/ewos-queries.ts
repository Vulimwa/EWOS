/** Shared TanStack Query hooks for EWOS workspace data (browser Data API, RLS-scoped). */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listEvents, subscribeToEvents } from "@/sdk/event-bus";

export const DEMO_ORG_SLUG = "ewos-demo";

export function useOrg() {
  return useQuery({
    queryKey: ["org", DEMO_ORG_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", DEMO_ORG_SLUG)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useEvents(orgId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) return;
    const unsubscribe = subscribeToEvents(orgId, () => {
      queryClient.invalidateQueries({ queryKey: ["events", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", orgId] });
    });
    return unsubscribe;
  }, [orgId, queryClient]);

  return useQuery({
    queryKey: ["events", orgId],
    enabled: !!orgId,
    queryFn: () => listEvents(orgId!),
  });
}

export function useGauges(orgId: string | undefined) {
  return useQuery({
    queryKey: ["gauges", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("river_gauges")
        .select("*")
        .eq("org_id", orgId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useGaugeReadings(gaugeId: string | undefined) {
  return useQuery({
    queryKey: ["readings", gaugeId],
    enabled: !!gaugeId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gauge_readings")
        .select("level_m, recorded_at")
        .eq("gauge_id", gaugeId!)
        .order("recorded_at", { ascending: false })
        .limit(14);
      if (error) throw error;
      return (data ?? []).reverse();
    },
  });
}

export function useBoundaries(orgId: string | undefined) {
  return useQuery({
    queryKey: ["boundaries", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_boundaries")
        .select("*")
        .eq("org_id", orgId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useModulesCatalog() {
  return useQuery({
    queryKey: ["modules-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("status", "published")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useModuleInstalls(orgId: string | undefined) {
  return useQuery({
    queryKey: ["module-installs", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_installs")
        .select("*, modules(*)")
        .eq("org_id", orgId!)
        .eq("enabled", true);
      if (error) throw error;
      return data;
    },
  });
}

export function useNotifications(orgId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}