import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Network, Package, ChevronRight } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg, useModuleInstalls } from "@/lib/ewos-queries";
import {
  buildHierarchy,
  useCommandCenters,
  type CommandCenterNode,
} from "@/lib/portal-queries";

export const Route = createFileRoute("/portal/hierarchy")({
  component: HierarchyPage,
});

function HierarchyPage() {
  const { data: org } = useOrg();
  const { data: centers } = useCommandCenters(org?.id);
  const { data: installs } = useModuleInstalls(org?.id);
  const tree = buildHierarchy(centers);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const createCenter = useMutation({
    mutationFn: async () => {
      if (!org || !name.trim()) throw new Error("Name required");
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { error } = await supabase.from("command_centers").insert({
        org_id: org.id,
        parent_id: parentId || null,
        name: name.trim(),
        slug,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Command Center created");
      setName("");
      setParentId("");
      queryClient.invalidateQueries({ queryKey: ["command-centers", org?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  const appsByCenter = new Map<string, typeof installs>();
  (installs ?? []).forEach((i) => {
    const key = i.command_center_id ?? "unassigned";
    if (!appsByCenter.has(key)) appsByCenter.set(key, []);
    appsByCenter.get(key)!.push(i);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Structure</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Command Centers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize HazardApps into nested Command Centers. Anything from HUSIKA-style aggregators to
          county-level operations centers.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Create Command Center</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Disaster Operations Center"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Parent (optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">— Root —</option>
              {(centers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => createCenter.mutate()}
            disabled={createCenter.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="size-4" /> Create
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Hierarchy</h2>
        {tree.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">No command centers yet.</p>
        )}
        <ul className="space-y-1">
          {tree.map((node) => (
            <TreeNode key={node.id} node={node} depth={0} appsByCenter={appsByCenter} />
          ))}
        </ul>
      </section>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

function TreeNode({
  node,
  depth,
  appsByCenter,
}: {
  node: CommandCenterNode;
  depth: number;
  appsByCenter: Map<string, ReturnType<typeof useModuleInstalls>["data"]>;
}) {
  const apps = appsByCenter.get(node.id) ?? [];
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
        style={{ paddingLeft: 8 + depth * 20 }}
      >
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <Network className="size-4 text-primary" />
        <span className="text-sm font-medium">{node.name}</span>
        <span className="text-[10px] text-muted-foreground">{node.slug}</span>
        {node.description && (
          <span className="ml-2 truncate text-xs text-muted-foreground">· {node.description}</span>
        )}
      </div>
      {apps.length > 0 && (
        <ul className="ml-6 border-l border-border/60 pl-3">
          {apps.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
              style={{ paddingLeft: depth * 20 }}
            >
              <Package className="size-3.5" />
              {a.modules?.name ?? a.module_id}
            </li>
          ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <ul className="space-y-1">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} appsByCenter={appsByCenter} />
          ))}
        </ul>
      )}
    </li>
  );
}