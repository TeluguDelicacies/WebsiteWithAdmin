-- Add show_quick_layout column to site_settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_quick_layout') THEN
        ALTER TABLE site_settings ADD COLUMN show_quick_layout BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
