# EWOS Plugin SDK (v0.1)

HazardApps are self-contained hazard modules that plug into the EWOS shell. They register UI panels, map layers, and event topics — never touching the shell or other modules directly.

## Defining a HazardApp

```ts
import { defineHazardApp } from "@/sdk";

export const floodWatch = defineHazardApp({
  slug: "flood-watch",
  name: "Flood Watch",
  version: "0.1.0",
  icon: "waves",
  permissions: ["map:layers", "events:publish", "notifications:request"],
  publishes: ["FloodAlertIssued"],
  subscribes: [],
  panels: [{ id: "flood-gauges", title: "River Gauges", placement: "map-overlay", component: FloodPanel }],
  mapLayers: [{ id: "flood-forecast", title: "Flood forecast", kind: "geojson-fill", defaultVisible: true }],
  hooks: {
    onActivate: async (ctx) => { /* subscribe, warm caches */ },
    onDeactivate: async (ctx) => { /* cleanup */ },
  },
});
```

Register it in `src/modules/registry.ts`. The shell renders nav entries, panels and layers from the registry.

## Events

- Publish: `publishEvent({ orgId, topic, severity, payload, geomGeojson, sourceModule })` (`src/sdk/event-bus.ts`)
- Subscribe: `subscribeToEvents(orgId, handler)` — realtime; returns an unsubscribe fn.
- Payloads must validate against `src/events/schemas/<topic>.schema.json`. Version bumps follow semver.

## Publishing checklist (marketplace)

1. Module manifest complete: slug, name, semver version, icon, category, publisher
2. `permissions[]` minimal and declared (map:layers, events:publish, events:subscribe, notifications:request)
3. `privacy_classification`: `public-data` | `contains-pii` (PII modules must document retention + consent flow)
4. JSON Schema for every published topic, registered in the manifest
5. Smoke test: activation, panel render, one published event visible in the feed
6. Listing metadata row in `modules` table (see Flood Watch seed as the canonical example)