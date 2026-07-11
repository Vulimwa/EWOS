CREATE EXTENSION IF NOT EXISTS postgis;

-- ===== roles enum =====
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'viewer');

-- ===== organizations =====
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  center_lng DOUBLE PRECISION NOT NULL DEFAULT 34.0,
  center_lat DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  default_zoom DOUBLE PRECISION NOT NULL DEFAULT 9,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (true);

-- ===== user_roles (separate table, security-definer check) =====
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  )
$$;

-- ===== modules (Capability Store catalog) =====
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '0.1.0',
  category TEXT NOT NULL DEFAULT 'hazard',
  publisher TEXT NOT NULL DEFAULT 'EWOS Core',
  icon TEXT NOT NULL DEFAULT 'box',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  event_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published',
  privacy_classification TEXT NOT NULL DEFAULT 'public-data',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon;
GRANT SELECT ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published modules" ON public.modules FOR SELECT USING (status = 'published');

-- ===== module_installs =====
CREATE TABLE public.module_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, module_id)
);
GRANT SELECT ON public.module_installs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_installs TO authenticated;
GRANT ALL ON public.module_installs TO service_role;
ALTER TABLE public.module_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view module installs" ON public.module_installs FOR SELECT USING (true);
CREATE POLICY "Org admins manage installs" ON public.module_installs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'admin')) WITH CHECK (public.has_role(auth.uid(), org_id, 'admin'));

-- ===== events (event bus) =====
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  severity TEXT NOT NULL DEFAULT 'advisory',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  geom GEOMETRY(Geometry, 4326),
  geom_geojson JSONB,
  source_module TEXT NOT NULL DEFAULT 'core',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_org_topic ON public.events (org_id, topic, occurred_at DESC);
CREATE INDEX idx_events_geom ON public.events USING GIST (geom);
GRANT SELECT ON public.events TO anon;
GRANT INSERT ON public.events TO anon;
GRANT SELECT, INSERT ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Demo pipeline can publish demo org events" ON public.events FOR INSERT
  WITH CHECK (org_id = '00000000-0000-4000-8000-000000000001'::uuid);

-- ===== notifications =====
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'in-app',
  status TEXT NOT NULL DEFAULT 'queued',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.notifications TO anon;
GRANT SELECT, INSERT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Demo pipeline can queue demo notifications" ON public.notifications FOR INSERT
  WITH CHECK (org_id = '00000000-0000-4000-8000-000000000001'::uuid);

-- ===== river_gauges =====
CREATE TABLE public.river_gauges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  river_name TEXT NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326),
  warning_level_m DOUBLE PRECISION NOT NULL DEFAULT 3.0,
  danger_level_m DOUBLE PRECISION NOT NULL DEFAULT 4.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.river_gauges TO anon;
GRANT SELECT ON public.river_gauges TO authenticated;
GRANT ALL ON public.river_gauges TO service_role;
ALTER TABLE public.river_gauges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gauges" ON public.river_gauges FOR SELECT USING (true);

-- ===== gauge_readings =====
CREATE TABLE public.gauge_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gauge_id UUID NOT NULL REFERENCES public.river_gauges(id) ON DELETE CASCADE,
  level_m DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gauge_readings_gauge_time ON public.gauge_readings (gauge_id, recorded_at DESC);
GRANT SELECT, INSERT ON public.gauge_readings TO anon;
GRANT SELECT, INSERT ON public.gauge_readings TO authenticated;
GRANT ALL ON public.gauge_readings TO service_role;
ALTER TABLE public.gauge_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view readings" ON public.gauge_readings FOR SELECT USING (true);
CREATE POLICY "Demo pipeline can ingest readings" ON public.gauge_readings FOR INSERT
  WITH CHECK (gauge_id IN (SELECT id FROM public.river_gauges WHERE org_id = '00000000-0000-4000-8000-000000000001'::uuid));

-- ===== admin_boundaries =====
CREATE TABLE public.admin_boundaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'district',
  geom GEOMETRY(Geometry, 4326),
  geom_geojson JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_boundaries TO anon;
GRANT SELECT ON public.admin_boundaries TO authenticated;
GRANT ALL ON public.admin_boundaries TO service_role;
ALTER TABLE public.admin_boundaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view boundaries" ON public.admin_boundaries FOR SELECT USING (true);

-- ===== realtime on events =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- ===== seed data =====
INSERT INTO public.organizations (id, name, slug, center_lng, center_lat, default_zoom)
VALUES ('00000000-0000-4000-8000-000000000001', 'EWOS Demo — Lake Victoria Basin', 'ewos-demo', 34.02, 0.10, 10);

INSERT INTO public.modules (id, slug, name, description, version, category, publisher, icon, permissions, event_topics, status, privacy_classification) VALUES
('00000000-0000-4000-8000-000000000101', 'flood-watch', 'Flood Watch', 'River gauge monitoring, flood forecast layers and automated FloodAlertIssued events with GeoJSON impact polygons.', '0.1.0', 'hydromet', 'EWOS Core', 'waves', '["map:layers","events:publish","notifications:request"]'::jsonb, '["FloodAlertIssued"]'::jsonb, 'published', 'public-data'),
('00000000-0000-4000-8000-000000000102', 'drought-index', 'Drought Index', 'NDVI / SPI based drought monitoring emitting VegetationStressHigh events. (Coming in Sprint 3)', '0.0.1', 'agromet', 'EWOS Core', 'sun', '["map:layers","events:publish"]'::jsonb, '["VegetationStressHigh"]'::jsonb, 'published', 'public-data'),
('00000000-0000-4000-8000-000000000103', 'wildfire-risk', 'Wildfire Risk', 'Fuel-moisture and wind driven wildfire risk scoring. Subscribes to VegetationStressHigh. (Coming in Sprint 3)', '0.0.1', 'fire', 'EWOS Core', 'flame', '["map:layers","events:subscribe","events:publish"]'::jsonb, '["WildfireRiskUpdate"]'::jsonb, 'published', 'public-data'),
('00000000-0000-4000-8000-000000000104', 'community-reports', 'Community Reports', 'Crowdsourced ground-truth reports with PII-safe intake and moderation. (Coming in Sprint 4)', '0.0.1', 'community', 'EWOS Core', 'users', '["events:publish","notifications:request"]'::jsonb, '["CommunityReportSubmitted"]'::jsonb, 'published', 'contains-pii');

INSERT INTO public.module_installs (org_id, module_id, enabled)
VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', true);

INSERT INTO public.river_gauges (id, org_id, name, river_name, lng, lat, location, warning_level_m, danger_level_m)
VALUES ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'Nzoia RGS 1EF01 — Rwambwa', 'Nzoia River', 34.088, 0.125, ST_SetSRID(ST_MakePoint(34.088, 0.125), 4326), 3.2, 4.8);

INSERT INTO public.gauge_readings (gauge_id, level_m, recorded_at) VALUES
('00000000-0000-4000-8000-000000000201', 2.10, now() - interval '10 hours'),
('00000000-0000-4000-8000-000000000201', 2.45, now() - interval '8 hours'),
('00000000-0000-4000-8000-000000000201', 2.90, now() - interval '6 hours'),
('00000000-0000-4000-8000-000000000201', 3.35, now() - interval '4 hours'),
('00000000-0000-4000-8000-000000000201', 3.80, now() - interval '2 hours'),
('00000000-0000-4000-8000-000000000201', 4.15, now() - interval '30 minutes');

INSERT INTO public.admin_boundaries (id, org_id, name, level, geom, geom_geojson) VALUES
('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'Budalangi Flood Plain', 'ward',
 ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[33.95,0.02],[34.12,0.02],[34.16,0.10],[34.12,0.20],[33.97,0.18],[33.92,0.09],[33.95,0.02]]]}'), 4326),
 '{"type":"Polygon","coordinates":[[[33.95,0.02],[34.12,0.02],[34.16,0.10],[34.12,0.20],[33.97,0.18],[33.92,0.09],[33.95,0.02]]]}'::jsonb);

INSERT INTO public.events (org_id, topic, schema_version, severity, payload, geom, geom_geojson, source_module, occurred_at) VALUES
('00000000-0000-4000-8000-000000000001', 'FloodAlertIssued', '1.0.0', 'warning',
 '{"gauge_id":"00000000-0000-4000-8000-000000000201","gauge_name":"Nzoia RGS 1EF01 — Rwambwa","river":"Nzoia River","level_m":3.8,"warning_level_m":3.2,"danger_level_m":4.8,"trend":"rising","affected_population_estimate":12400,"recommended_actions":["Pre-position evacuation boats at Rwambwa crossing","Issue community SMS advisory for Budalangi ward"]}'::jsonb,
 ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[34.00,0.05],[34.12,0.05],[34.14,0.12],[34.08,0.17],[33.99,0.14],[34.00,0.05]]]}'), 4326),
 '{"type":"Polygon","coordinates":[[[34.00,0.05],[34.12,0.05],[34.14,0.12],[34.08,0.17],[33.99,0.14],[34.00,0.05]]]}'::jsonb,
 'flood-watch', now() - interval '2 hours'),
('00000000-0000-4000-8000-000000000001', 'VegetationStressHigh', '1.0.0', 'watch',
 '{"index":"NDVI_anomaly","value":-0.31,"threshold":-0.25,"region_name":"Siaya lowlands","window_days":30}'::jsonb,
 ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[34.18,0.00],[34.35,0.00],[34.35,0.15],[34.18,0.15],[34.18,0.00]]]}'), 4326),
 '{"type":"Polygon","coordinates":[[[34.18,0.00],[34.35,0.00],[34.35,0.15],[34.18,0.15],[34.18,0.00]]]}'::jsonb,
 'drought-index', now() - interval '26 hours');