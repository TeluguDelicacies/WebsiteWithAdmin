-- Add Telugu Site Title to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS site_title_telugu TEXT;

-- Pre-populate with a default value if desired, or keep NULL
UPDATE public.site_settings 
SET site_title_telugu = 'తెలుగు డెలికాసీస్'
WHERE site_title_telugu IS NULL;
