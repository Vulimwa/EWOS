import { defineHazardApp } from "@/sdk";
import { FloodPanel } from "./FloodPanel";

export const floodWatch = defineHazardApp({
  slug: "flood-watch",
  name: "Flood Watch",
  version: "0.1.0",
  icon: "waves",
  category: "hydromet",
  permissions: ["map:layers", "events:publish", "notifications:request"],
  publishes: ["FloodAlertIssued"],
  subscribes: [],
  panels: [{ id: "flood-gauges", title: "River Gauges", placement: "map-overlay", component: FloodPanel }],
  mapLayers: [{ id: "flood-forecast", title: "Flood forecast", kind: "geojson-fill", defaultVisible: true }],
});