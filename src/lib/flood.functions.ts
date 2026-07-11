/**
 * Flood Watch backend — Sprint 1 demo pipeline.
 *
 * runFloodRiskScan: ingests a synthetic gauge reading (simulating the
 * scheduled ingest job), classifies flood risk against gauge thresholds,
 * and — when at watch level or above — publishes a FloodAlertIssued event
 * (schema 1.0.0) with a GeoJSON impact polygon plus an in-app notification.
 *
 * NOTE (manifest ISSUE-1): demo-org anon insert policies make this work
 * pre-auth. Sprint 2 replaces this with authenticated, role-checked calls.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";

const InputSchema = z.object({
  gaugeId: z.string().uuid(),
  /** optional forced level for deterministic tests */
  levelM: z.number().min(0).max(20).optional(),
});

function classifySeverity(level: number, warning: number, danger: number) {
  if (level >= danger) return "emergency" as const;
  if (level >= warning) return "warning" as const;
  if (level >= warning * 0.85) return "watch" as const;
  return "advisory" as const;
}

export const runFloodRiskScan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: gauge, error: gaugeError } = await supabase
      .from("river_gauges")
      .select("*")
      .eq("id", data.gaugeId)
      .eq("org_id", DEMO_ORG_ID)
      .single();
    if (gaugeError || !gauge) throw new Error("Gauge not found");

    const { data: lastReadings } = await supabase
      .from("gauge_readings")
      .select("level_m, recorded_at")
      .eq("gauge_id", gauge.id)
      .order("recorded_at", { ascending: false })
      .limit(2);

    const lastLevel = lastReadings?.[0]?.level_m ?? gauge.warning_level_m * 0.6;
    // Synthetic ingest: rise 0.10–0.35 m, capped a bit above danger level
    const newLevel =
      data.levelM ?? Math.min(lastLevel + 0.1 + Math.random() * 0.25, gauge.danger_level_m + 0.6);
    const roundedLevel = Math.round(newLevel * 100) / 100;

    const { error: readingError } = await supabase.from("gauge_readings").insert({
      gauge_id: gauge.id,
      level_m: roundedLevel,
      recorded_at: new Date().toISOString(),
    });
    if (readingError) throw new Error(`Reading ingest failed: ${readingError.message}`);

    const severity = classifySeverity(roundedLevel, gauge.warning_level_m, gauge.danger_level_m);
    const trend =
      roundedLevel > lastLevel + 0.02 ? "rising" : roundedLevel < lastLevel - 0.02 ? "falling" : "steady";

    let eventId: string | null = null;
    if (severity !== "advisory") {
      // Impact polygon: buffered box around the gauge, grown with severity
      const grow = severity === "emergency" ? 0.09 : severity === "warning" ? 0.06 : 0.035;
      const polygon = {
        type: "Polygon",
        coordinates: [
          [
            [gauge.lng - grow, gauge.lat - grow],
            [gauge.lng + grow, gauge.lat - grow],
            [gauge.lng + grow * 1.2, gauge.lat + grow * 0.6],
            [gauge.lng + grow * 0.4, gauge.lat + grow],
            [gauge.lng - grow * 0.8, gauge.lat + grow * 0.7],
            [gauge.lng - grow, gauge.lat - grow],
          ],
        ],
      };

      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .insert({
          org_id: DEMO_ORG_ID,
          topic: "FloodAlertIssued",
          schema_version: "1.0.0",
          severity,
          payload: {
            gauge_id: gauge.id,
            gauge_name: gauge.name,
            river: gauge.river_name,
            level_m: roundedLevel,
            warning_level_m: gauge.warning_level_m,
            danger_level_m: gauge.danger_level_m,
            trend,
            affected_population_estimate: severity === "emergency" ? 21500 : severity === "warning" ? 12400 : 4300,
            recommended_actions:
              severity === "emergency"
                ? ["Activate evacuation plan for Budalangi ward", "Dispatch rescue boats to Rwambwa crossing", "Broadcast emergency SMS + WhatsApp to registered contacts"]
                : severity === "warning"
                  ? ["Pre-position evacuation boats at Rwambwa crossing", "Issue community SMS advisory for Budalangi ward"]
                  : ["Increase gauge polling frequency", "Notify ward disaster committee"],
          },
          geom_geojson: polygon as never,
          source_module: "flood-watch",
          occurred_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (eventError) throw new Error(`Event publish failed: ${eventError.message}`);
      eventId = eventRow.id;

      await supabase.from("notifications").insert({
        org_id: DEMO_ORG_ID,
        event_id: eventId,
        channel: "in-app",
        status: "delivered",
        title: `Flood ${severity.toUpperCase()} — ${gauge.river_name}`,
        message: `${gauge.name} at ${roundedLevel.toFixed(2)} m (warning ${gauge.warning_level_m} m / danger ${gauge.danger_level_m} m), trend ${trend}.`,
      });
    }

    return {
      gaugeId: gauge.id,
      levelM: roundedLevel,
      trend,
      severity,
      eventPublished: eventId !== null,
      eventId,
    };
  });