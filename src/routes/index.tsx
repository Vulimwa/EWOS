import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Toaster, toast } from "sonner";
import "@/modules/registry";
import { TopBar } from "@/components/ewos/TopBar";
import { LeftNav } from "@/components/ewos/LeftNav";
import { MapCanvas, type MapLayersState } from "@/components/ewos/MapCanvas";
import { RightPanel } from "@/components/ewos/RightPanel";
import { BottomDock } from "@/components/ewos/BottomDock";
import { AIAssistant } from "@/components/ewos/AIAssistant";
import { getHazardApp } from "@/sdk";
import { runFloodRiskScan } from "@/lib/flood.functions";
import { useBoundaries, useEvents, useGauges, useOrg } from "@/lib/ewos-queries";

export const Route = createFileRoute("/")({
  component: Workspace,
});

const SEARCH_INPUT_ID = "ewos-global-search";

function Workspace() {
  const { data: org } = useOrg();
  const { data: events, isLoading: eventsLoading } = useEvents(org?.id);
  const { data: boundaries } = useBoundaries(org?.id);
  const { data: gauges } = useGauges(org?.id);

  const [navCollapsed, setNavCollapsed] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(320);
  const [activeModule, setActiveModule] = useState<string | null>("flood-watch");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [focusEventId, setFocusEventId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [layers, setLayers] = useState<MapLayersState>({ alerts: true, boundaries: true, gauges: true });

  const scan = useServerFn(runFloodRiskScan);
  const queryClient = useQueryClient();
  const scanMutation = useMutation({
    mutationFn: () => {
      if (!gauges?.[0]) throw new Error("No gauge available");
      return scan({ data: { gaugeId: gauges[0].id } });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["events", org?.id] });
      queryClient.invalidateQueries({ queryKey: ["readings", gauges?.[0]?.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications", org?.id] });
      toast(
        result.eventPublished
          ? `FloodAlertIssued — ${result.severity.toUpperCase()} at ${result.levelM.toFixed(2)} m`
          : `Scan complete — ${result.severity} (${result.levelM.toFixed(2)} m)`,
      );
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Scan failed"),
  });

  // Keyboard shortcuts: ⌘K search, [ nav, ] right panel, A assistant
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById(SEARCH_INPUT_ID)?.focus();
        return;
      }
      if (typing) return;
      if (e.key === "[") setNavCollapsed((v) => !v);
      if (e.key === "]") setRightOpen((v) => !v);
      if (e.key.toLowerCase() === "a") setAiOpen((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Right panel resize
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      dragState.current = { startX: e.clientX, startWidth: rightWidth };
      const move = (ev: PointerEvent) => {
        if (!dragState.current) return;
        const delta = dragState.current.startX - ev.clientX;
        setRightWidth(Math.min(520, Math.max(260, dragState.current.startWidth + delta)));
      };
      const up = () => {
        dragState.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [rightWidth],
  );

  const activeApp = activeModule ? getHazardApp(activeModule) : undefined;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        orgName={org?.name}
        orgId={org?.id}
        onToggleNav={() => setNavCollapsed((v) => !v)}
        searchInputId={SEARCH_INPUT_ID}
      />

      <div className="flex min-h-0 flex-1">
        <LeftNav
          collapsed={navCollapsed}
          orgId={org?.id}
          orgName={org?.name}
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />

        <main className="relative min-w-0 flex-1">
          <MapCanvas
            center={[org?.center_lng ?? 34.02, org?.center_lat ?? 0.1]}
            zoom={org?.default_zoom ?? 10}
            events={events ?? []}
            boundaries={(boundaries ?? []) as never}
            gauges={gauges ?? []}
            layers={layers}
            onLayersChange={setLayers}
            focusEventId={focusEventId}
            onSelectEvent={(id) => setSelectedEventId(id)}
          />
          {org &&
            activeApp?.panels
              .filter((p) => p.placement === "map-overlay")
              .map((panel) => <panel.component key={panel.id} orgId={org.id} />)}
        </main>

        {rightOpen && (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize contextual panel"
              onPointerDown={onResizeStart}
              className="w-1 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/60"
            />
            <div style={{ width: rightWidth }} className="shrink-0 border-l border-border">
              <RightPanel
                events={events ?? []}
                loading={eventsLoading}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                onFocusMap={(id) => setFocusEventId(id)}
                onOpenAI={() => setAiOpen(true)}
              />
            </div>
          </>
        )}
      </div>

      <BottomDock
        activeModule={activeModule}
        scanning={scanMutation.isPending}
        onRunScan={() => scanMutation.mutate()}
        onToggleAI={() => setAiOpen((v) => !v)}
        eventCount={events?.length ?? 0}
      />

      <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
