/**
 * EWOS Event Bus — client adapter (v1)
 *
 * Backed by the org-scoped `events` table with realtime streaming.
 * Event payloads must conform to the JSON Schemas in src/events/schemas/,
 * versioned via `schema_version` (semver).
 */
import { supabase } from "@/integrations/supabase/client";
import type { Geometry } from "geojson";
import type { EwosEventEnvelope, EwosSeverity } from "./index";

export interface EwosEventRow {
  id: string;
  org_id: string;
  topic: string;
  schema_version: string;
  severity: EwosSeverity;
  payload: Record<string, unknown>;
  geom_geojson: Geometry | null;
  source_module: string;
  occurred_at: string;
  created_at: string;
}

export async function listEvents(orgId: string, limit = 50): Promise<EwosEventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("org_id", orgId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as EwosEventRow[];
}

export async function publishEvent(envelope: EwosEventEnvelope): Promise<void> {
  const { error } = await supabase.from("events").insert({
    org_id: envelope.org_id,
    topic: envelope.topic,
    schema_version: envelope.schema_version,
    severity: envelope.severity,
    payload: envelope.payload as never,
    geom_geojson: (envelope.geom_geojson ?? null) as never,
    source_module: envelope.source_module,
    occurred_at: envelope.occurred_at ?? new Date().toISOString(),
  });
  if (error) throw error;
}

/** Subscribe to new events for an org. Returns an unsubscribe function. */
export function subscribeToEvents(orgId: string, onEvent: (event: EwosEventRow) => void): () => void {
  const channel = supabase
    .channel(`events-${orgId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "events", filter: `org_id=eq.${orgId}` },
      (payload) => onEvent(payload.new as EwosEventRow),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}