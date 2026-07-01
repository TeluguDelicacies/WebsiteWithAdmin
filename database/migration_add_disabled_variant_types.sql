-- Migration: Add disabled_variant_types to site_settings table

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'disabled_variant_types') THEN
        ALTER TABLE public.site_settings ADD COLUMN disabled_variant_types JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
