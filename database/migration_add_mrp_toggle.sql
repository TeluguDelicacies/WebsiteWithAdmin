-- Add show_mrp column to site_settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_mrp') THEN
        ALTER TABLE site_settings ADD COLUMN show_mrp BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
