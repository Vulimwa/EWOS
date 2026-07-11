import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Crosshair, ListOrdered, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import type { EwosEventRow } from "@/sdk/event-bus";

type Tab = "alerts" | "detail" | "ai";

interface RightPanelProps {
  events: EwosEventRow[];
  loading: boolean;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  onFocusMap: (id: string) => void;
  onOpenAI: () => void;
}

export function RightPanel({ events, loading, selectedEventId, onSelectEvent, onFocusMap, onOpenAI }: RightPanelProps) {
  const [tab, setTab] = useState<Tab>("alerts");
  const selected = events.find((e) => e.id === selectedEventId) ?? null;

  useEffect(() => {
    if (selectedEventId) setTab("detail");
  }, [selectedEventId]);

  return (
    <div className="flex h-full flex-col bg-panel">
      <div role="tablist" aria-label="Contextual panel" className="flex shrink-0 border-b border-border">
        {(
          [
            ["alerts", "Alerts"],
            ["detail", "Detail"],
            ["ai", "AI"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 border-b-2 px-2 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {key === "alerts" && !!events.length && (
              <span className="ml-1.5 text-data text-[10px] text-muted-foreground">{events.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "alerts" && (
          <ul aria-label="Event feed" className="divide-y divide-border/60">
            {loading && <li className="px-3 py-4 text-xs text-muted-foreground">Loading events…</li>}
            {!loading && !events.length && (
              <li className="px-3 py-4 text-xs text-muted-foreground">No events yet — run a flood risk scan.</li>
            )}
            {events.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => onSelectEvent(event.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 px-3 py-2 text-left transition-colors hover:bg-accent/40",
                    event.id === selectedEventId && "bg-accent/50",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-data text-xs font-medium text-foreground">{event.topic}</span>
                    <SeverityBadge severity={event.severity} />
                  </span>
                  <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="text-data">{event.source_module}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(event.occurred_at), { addSuffix: true })}</span>
                    <span>·</span>
                    <span className="text-data">v{event.schema_version}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "detail" &&
          (selected ? (
            <div className="space-y-3 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-data text-sm font-semibold text-foreground">{selected.topic}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(selected.occurred_at).toISOString().replace("T", " ").slice(0, 19)} UTC ·{" "}
                    {selected.source_module}
                  </p>
                </div>
                <SeverityBadge severity={selected.severity} />
              </div>

              <button
                onClick={() => onFocusMap(selected.id)}
                className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-secondary px-2 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Crosshair className="size-3" /> Focus on map
              </button>

              <dl className="space-y-1 rounded-md border border-border bg-background/50 p-2.5">
                {Object.entries(selected.payload)
                  .filter(([, v]) => typeof v !== "object" || v === null)
                  .map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-3">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{key.replaceAll("_", " ")}</dt>
                      <dd className="text-data text-xs text-foreground">{String(value)}</dd>
                    </div>
                  ))}
              </dl>

              {Array.isArray(selected.payload.recommended_actions) && (
                <div>
                  <p className="flex items-center gap-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <ListOrdered className="size-3" /> Recommended actions
                  </p>
                  <ol className="space-y-1.5">
                    {(selected.payload.recommended_actions as string[]).map((action, i) => (
                      <li key={i} className="flex gap-2 rounded-md border border-border/70 bg-background/40 px-2 py-1.5 text-xs text-foreground">
                        <span className="text-data text-primary">{String(i + 1).padStart(2, "0")}</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <p className="px-3 py-4 text-xs text-muted-foreground">Select an event from the Alerts tab.</p>
          ))}

        {tab === "ai" && (
          <div className="space-y-3 p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The AI Decision Assistant reads the live event feed and helps interpret the situation (Explain) or draft
              response actions (Act).
            </p>
            <button
              onClick={onOpenAI}
              className="flex h-8 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-3.5" /> Open AI Assistant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}