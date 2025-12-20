-- Add sub_brand_logo_url column to categories table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sub_brand_logo_url') THEN
        ALTER TABLE categories ADD COLUMN sub_brand_logo_url TEXT;
    END IF;
END $$;
