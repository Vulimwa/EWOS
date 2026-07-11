/**
 * EWOS Plugin SDK — v0.1.0
 *
 * HazardApps register through this SDK. The workspace shell renders nav
 * entries, panels and map layers from the registry; modules never import
 * the shell or each other. Cross-module communication happens exclusively
 * over the event bus (see ./event-bus.ts).
 */
import type { ComponentType } from "react";
import type { Geometry } from "geojson";

export type EwosSeverity = "advisory" | "watch" | "warning" | "emergency";

export type EwosPermission =
  | "map:layers"
  | "events:publish"
  | "events:subscribe"
  | "notifications:request"
  | "ai:prompts";

export interface EwosEventEnvelope<TPayload = Record<string, unknown>> {
  id?: string;
  org_id: string;
  topic: string;
  schema_version: string;
  severity: EwosSeverity;
  payload: TPayload;
  geom_geojson?: Geometry | null;
  source_module: string;
  occurred_at?: string;
}

export interface HazardAppPanel {
  id: string;
  title: string;
  /** map-overlay panels float over the map canvas; right-panel panels dock in the contextual panel */
  placement: "map-overlay" | "right-panel";
  component: ComponentType<{ orgId: string }>;
}

export interface HazardAppMapLayer {
  id: string;
  title: string;
  kind: "geojson-fill" | "geojson-line" | "geojson-point";
  defaultVisible: boolean;
}

export interface HazardAppContext {
  orgId: string;
}

export interface HazardAppDefinition {
  slug: string;
  name: string;
  version: string;
  /** lucide icon name used by the shell nav */
  icon: string;
  category?: string;
  permissions: EwosPermission[];
  publishes: string[];
  subscribes: string[];
  panels: HazardAppPanel[];
  mapLayers: HazardAppMapLayer[];
  hooks?: {
    onInstall?: (ctx: HazardAppContext) => Promise<void> | void;
    onActivate?: (ctx: HazardAppContext) => Promise<void> | void;
    onDeactivate?: (ctx: HazardAppContext) => Promise<void> | void;
  };
}

/** Identity helper that gives authors full type inference + a future hook point for validation. */
export function defineHazardApp(def: HazardAppDefinition): HazardAppDefinition {
  if (!/^[a-z][a-z0-9-]*$/.test(def.slug)) {
    throw new Error(`HazardApp slug "${def.slug}" must be kebab-case`);
  }
  return def;
}

const registry = new Map<string, HazardAppDefinition>();

export function registerHazardApp(app: HazardAppDefinition) {
  registry.set(app.slug, app);
}

export function getRegisteredHazardApps(): HazardAppDefinition[] {
  return [...registry.values()];
}

export function getHazardApp(slug: string): HazardAppDefinition | undefined {
  return registry.get(slug);
}