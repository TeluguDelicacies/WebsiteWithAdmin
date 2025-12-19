-- Add Sales Mode toggle to site_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'sales_mode_enabled') THEN
        ALTER TABLE site_settings ADD COLUMN sales_mode_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
