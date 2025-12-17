-- Add show_product_ticker column to site_settings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_product_ticker') THEN
        ALTER TABLE site_settings ADD COLUMN show_product_ticker BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
