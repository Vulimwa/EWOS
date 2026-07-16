/** TanStack Query hooks for the Organization Portal (browser Data API, RLS-scoped). */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCommandCenters(orgId: string | undefined) {
  return useQuery({
    queryKey: ["command-centers", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("command_centers")
        .select("*")
        .eq("org_id", orgId!)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useIncidents(orgId: string | undefined) {
  return useQuery({
    queryKey: ["incidents", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*, command_centers(name, slug)")
        .eq("org_id", orgId!)
        .order("opened_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useAssets(orgId: string | undefined) {
  return useQuery({
    queryKey: ["assets", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export type CommandCenter = NonNullable<ReturnType<typeof useCommandCenters>["data"]>[number];
export type Incident = NonNullable<ReturnType<typeof useIncidents>["data"]>[number];
export type Asset = NonNullable<ReturnType<typeof useAssets>["data"]>[number];

/** Build a nested tree from flat command_centers rows. */
export interface CommandCenterNode extends CommandCenter {
  children: CommandCenterNode[];
}
export function buildHierarchy(rows: CommandCenter[] | undefined): CommandCenterNode[] {
  if (!rows) return [];
  const byId = new Map<string, CommandCenterNode>(rows.map((r) => [r.id, { ...r, children: [] }]));
  const roots: CommandCenterNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) byId.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}