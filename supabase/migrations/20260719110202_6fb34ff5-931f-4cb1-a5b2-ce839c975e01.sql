
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT '1b3ade87-197b-4874-8422-94e644224b4c'::uuid,
       '00000000-0000-4000-8000-000000000001'::uuid,
       r::public.app_role
FROM unnest(ARRAY['viewer','operator','admin','responder','developer','platform_admin','citizen']) AS r
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.citizen_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001'::uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  severity TEXT NOT NULL DEFAULT 'moderate',
  status TEXT NOT NULL DEFAULT 'submitted',
  location_name TEXT,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  photo_url TEXT,
  contact TEXT,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.citizen_reports TO authenticated;
GRANT ALL ON public.citizen_reports TO service_role;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporters read own reports" ON public.citizen_reports
  FOR SELECT TO authenticated USING (reporter_id = auth.uid());
CREATE POLICY "reporters insert own reports" ON public.citizen_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reporters update own reports" ON public.citizen_reports
  FOR UPDATE TO authenticated USING (reporter_id = auth.uid());
CREATE POLICY "org staff read all reports" ON public.citizen_reports
  FOR SELECT TO authenticated
  USING (
    public.is_org_member(auth.uid(), org_id)
    OR public.has_role(auth.uid(), org_id, 'platform_admin'::public.app_role)
  );
CREATE POLICY "org staff update reports" ON public.citizen_reports
  FOR UPDATE TO authenticated
  USING (
    public.is_org_member(auth.uid(), org_id)
    OR public.has_role(auth.uid(), org_id, 'platform_admin'::public.app_role)
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS citizen_reports_updated_at ON public.citizen_reports;
CREATE TRIGGER citizen_reports_updated_at
BEFORE UPDATE ON public.citizen_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  demo_org UUID := '00000000-0000-4000-8000-000000000001';
  portal TEXT := COALESCE(NEW.raw_user_meta_data->>'intended_portal', 'organization');
  assigned public.app_role;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, intended_portal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    portal
  ) ON CONFLICT (id) DO UPDATE SET intended_portal = EXCLUDED.intended_portal;

  assigned := CASE portal
    WHEN 'developer' THEN 'developer'::public.app_role
    WHEN 'citizen'   THEN 'citizen'::public.app_role
    ELSE 'viewer'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (NEW.id, demo_org, assigned) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $function$;
