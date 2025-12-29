-- Remove legacy address columns from site_settings
ALTER TABLE public.site_settings 
DROP COLUMN IF EXISTS address_line1,
DROP COLUMN IF EXISTS address_line2;
