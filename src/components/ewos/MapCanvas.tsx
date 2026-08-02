import { useEffect, useRef, useState } from "react";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import type { Geometry } from "geojson";
import { Layers, Map as MapIcon, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EwosEventRow } from "@/sdk/event-bus";

export interface MapLayersState {
  alerts: boolean;
  boundaries: boolean;
  gauges: boolean;
}

interface Boundary {
  id: string;
  name: string;
  geom_geojson: unknown;
}
interface Gauge {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

interface MapCanvasProps {
  center: [number, number];
  zoom: number;
  events: EwosEventRow[];
  boundaries: Boundary[];
  gauges: Gauge[];
  layers: MapLayersState;
  onLayersChange: (layers: MapLayersState) => void;
  focusEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  advisory: "#4da3ff",
  watch: "#e5c245",
  warning: "#f08c3a",
  emergency: "#e5484d",
};

type BasemapId = "street" | "humanitarian";

const BASEMAP_LABELS: Record<BasemapId, string> = {
  street: "OpenStreetMap",
  humanitarian: "OpenStreetMap Humanitarian",
};

function getMapStyle(activeBasemap: BasemapId) {
  return {
    version: 8,
    sources: {
      street: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
      humanitarian: {
        type: "raster",
        tiles: ["https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
      boundaries: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      alerts: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      gauges: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
    },
    layers: [
      {
        id: "street",
        type: "raster",
        source: "street",
        layout: { visibility: activeBasemap === "street" ? "visible" : "none" },
      },
      {
        id: "humanitarian",
        type: "raster",
        source: "humanitarian",
        layout: { visibility: activeBasemap === "humanitarian" ? "visible" : "none" },
      },
      {
        id: "boundaries-line",
        type: "line",
        source: "boundaries",
        paint: {
          "line-color": "#4cc9d4",
          "line-width": 1.4,
          "line-dasharray": [3, 2],
          "line-opacity": 0.8,
        },
      },
      {
        id: "alerts-fill",
        type: "fill",
        source: "alerts",
        paint: {
          "fill-color": [
            "match",
            ["get", "severity"],
            "emergency",
            SEVERITY_COLORS.emergency,
            "warning",
            SEVERITY_COLORS.warning,
            "watch",
            SEVERITY_COLORS.watch,
            SEVERITY_COLORS.advisory,
          ],
          "fill-opacity": 0.28,
        },
      },
      {
        id: "alerts-line",
        type: "line",
        source: "alerts",
        paint: {
          "line-color": [
            "match",
            ["get", "severity"],
            "emergency",
            SEVERITY_COLORS.emergency,
            "warning",
            SEVERITY_COLORS.warning,
            "watch",
            SEVERITY_COLORS.watch,
            SEVERITY_COLORS.advisory,
          ],
          "line-width": 1.6,
        },
      },
      {
        id: "gauges-circle",
        type: "circle",
        source: "gauges",
        paint: {
          "circle-radius": 6,
          "circle-color": "#4cc9d4",
          "circle-stroke-color": "#0d1420",
          "circle-stroke-width": 2,
        },
      },
    ],
  } as const;
}

function geometryBounds(geom: Geometry): [[number, number], [number, number]] | null {
  const coords: number[][] = [];
  const collect = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === "number") coords.push(c as number[]);
    else if (Array.isArray(c)) c.forEach(collect);
  };
  if ("coordinates" in geom) collect(geom.coordinates);
  if (!coords.length) return null;
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function MapCanvas({
  center,
  zoom,
  events,
  boundaries,
  gauges,
  layers,
  onLayersChange,
  focusEventId,
  onSelectEvent,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<BasemapId>("street");
  const [opacity, setOpacity] = useState(0.7);
  const [layersOpen, setLayersOpen] = useState(false);
  const selectRef = useRef(onSelectEvent);
  selectRef.current = onSelectEvent;

  const clickHandlerRef = useRef<((e: MapLayerMouseEvent) => void) | null>(null);
  const enterHandlerRef = useRef<(() => void) | null>(null);
  const leaveHandlerRef = useRef<(() => void) | null>(null);

  const ensureSourcesAndLayers = (map: MapLibreMap) => {
    if (!map.getSource("boundaries")) {
      map.addSource("boundaries", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getSource("alerts")) {
      map.addSource("alerts", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getSource("gauges")) {
      map.addSource("gauges", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    const ensureLayer = (layer: Parameters<MapLibreMap["addLayer"]>[0]) => {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    };

    ensureLayer({
      id: "boundaries-line",
      type: "line",
      source: "boundaries",
      paint: {
        "line-color": "#4cc9d4",
        "line-width": 1.4,
        "line-dasharray": [3, 2],
        "line-opacity": 0.8,
      },
    });
    ensureLayer({
      id: "alerts-fill",
      type: "fill",
      source: "alerts",
      paint: {
        "fill-color": [
          "match",
          ["get", "severity"],
          "emergency",
          SEVERITY_COLORS.emergency,
          "warning",
          SEVERITY_COLORS.warning,
          "watch",
          SEVERITY_COLORS.watch,
          SEVERITY_COLORS.advisory,
        ],
        "fill-opacity": 0.28,
      },
    });
    ensureLayer({
      id: "alerts-line",
      type: "line",
      source: "alerts",
      paint: {
        "line-color": [
          "match",
          ["get", "severity"],
          "emergency",
          SEVERITY_COLORS.emergency,
          "warning",
          SEVERITY_COLORS.warning,
          "watch",
          SEVERITY_COLORS.watch,
          SEVERITY_COLORS.advisory,
        ],
        "line-width": 1.6,
      },
    });
    ensureLayer({
      id: "gauges-circle",
      type: "circle",
      source: "gauges",
      paint: {
        "circle-radius": 6,
        "circle-color": "#4cc9d4",
        "circle-stroke-color": "#0d1420",
        "circle-stroke-width": 2,
      },
    });

    if (clickHandlerRef.current) map.off("click", "alerts-fill", clickHandlerRef.current);
    if (enterHandlerRef.current) map.off("mouseenter", "alerts-fill", enterHandlerRef.current);
    if (leaveHandlerRef.current) map.off("mouseleave", "alerts-fill", leaveHandlerRef.current);

    const clickHandler = (e: MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) selectRef.current(id);
    };
    const enterHandler = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leaveHandler = () => {
      map.getCanvas().style.cursor = "";
    };

    clickHandlerRef.current = clickHandler;
    enterHandlerRef.current = enterHandler;
    leaveHandlerRef.current = leaveHandler;

    map.on("click", "alerts-fill", clickHandler);
    map.on("mouseenter", "alerts-fill", enterHandler);
    map.on("mouseleave", "alerts-fill", leaveHandler);
  };

  // Init map once (client only)
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        center,
        zoom,
        attributionControl: { compact: true },
        style: getMapStyle("street"),
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
      map.on("load", () => {
        if (!map) return;
        mapRef.current = map;
        ensureSourcesAndLayers(map);
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync data sources.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    ensureSourcesAndLayers(map);

    const alertFeatures = events
      .filter((e) => e.geom_geojson)
      .map((e) => ({
        type: "Feature" as const,
        geometry: e.geom_geojson as Geometry,
        properties: { id: e.id, severity: e.severity, topic: e.topic },
      }));

    (map.getSource("alerts") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: alertFeatures,
    });
    (map.getSource("boundaries") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: boundaries.map((b) => ({
        type: "Feature" as const,
        geometry: b.geom_geojson as Geometry,
        properties: { name: b.name },
      })),
    });
    (map.getSource("gauges") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: gauges.map((g) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [g.lng, g.lat] },
        properties: { name: g.name },
      })),
    });
  }, [events, boundaries, gauges, ready]);

  // Sync basemap selection.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty("street", "visibility", basemap === "street" ? "visible" : "none");
    map.setLayoutProperty(
      "humanitarian",
      "visibility",
      basemap === "humanitarian" ? "visible" : "none",
    );
  }, [basemap, ready]);

  // Sync overlay visibility + opacity.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (
      !map.getLayer("alerts-fill") ||
      !map.getLayer("alerts-line") ||
      !map.getLayer("boundaries-line") ||
      !map.getLayer("gauges-circle")
    ) {
      return;
    }
    map.setLayoutProperty("alerts-fill", "visibility", layers.alerts ? "visible" : "none");
    map.setLayoutProperty("alerts-line", "visibility", layers.alerts ? "visible" : "none");
    map.setLayoutProperty("boundaries-line", "visibility", layers.boundaries ? "visible" : "none");
    map.setLayoutProperty("gauges-circle", "visibility", layers.gauges ? "visible" : "none");
    map.setPaintProperty("alerts-fill", "fill-opacity", 0.4 * opacity);
    map.setPaintProperty("alerts-line", "line-opacity", Math.min(1, opacity + 0.2));
  }, [layers, opacity, ready]);

  // Focus selected event.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focusEventId) return;
    const event = events.find((e) => e.id === focusEventId);
    if (!event?.geom_geojson) return;
    const bounds = geometryBounds(event.geom_geojson as Geometry);
    if (bounds) map.fitBounds(bounds, { padding: 80, duration: 600, maxZoom: 12 });
  }, [focusEventId, events, ready]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="application"
        aria-label="Hazard situation map"
      />

      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
        <div className="panel-elevated flex items-center gap-0.5 rounded-md border border-border p-0.5">
          <button
            onClick={() => setBasemap("street")}
            aria-pressed={basemap === "street"}
            title={BASEMAP_LABELS.street}
            className={cn(
              "rounded-sm p-1.5 transition-colors",
              basemap === "street"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MapIcon className="size-3.5" />
          </button>
          <button
            onClick={() => setBasemap("humanitarian")}
            aria-pressed={basemap === "humanitarian"}
            title={BASEMAP_LABELS.humanitarian}
            className={cn(
              "rounded-sm p-1.5 transition-colors",
              basemap === "humanitarian"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Mountain className="size-3.5" />
          </button>
          <button
            onClick={() => setLayersOpen((v) => !v)}
            aria-expanded={layersOpen}
            title="Layers"
            className={cn(
              "rounded-sm p-1.5 transition-colors",
              layersOpen
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-3.5" />
          </button>
        </div>

        {layersOpen && (
          <div className="overlay-elevated w-52 rounded-lg p-2.5">
            <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Layers
            </p>
            {(
              [
                ["alerts", "Hazard alert polygons"],
                ["boundaries", "Admin boundaries"],
                ["gauges", "River gauges"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs text-foreground hover:bg-accent/40"
              >
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={(e) => onLayersChange({ ...layers, [key]: e.target.checked })}
                  className="size-3.5 accent-[var(--primary)]"
                />
                {label}
              </label>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              <label
                className="flex items-center justify-between text-[11px] text-muted-foreground"
                htmlFor="layer-opacity"
              >
                Overlay opacity
                <span className="text-data">{Math.round(opacity * 100)}%</span>
              </label>
              <input
                id="layer-opacity"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="mt-1 w-full accent-[var(--primary)]"
              />
            </div>
          </div>
        )}
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-data text-xs text-muted-foreground">Initialising GIS engine…</p>
        </div>
      )}
    </div>
  );
}
