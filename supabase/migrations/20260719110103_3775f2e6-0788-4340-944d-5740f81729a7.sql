
-- 1. Extend the app_role enum with 'citizen'
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'citizen';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
