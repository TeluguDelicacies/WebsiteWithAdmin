-- Add sub_category column to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sub_category') THEN
        ALTER TABLE products ADD COLUMN sub_category TEXT;
    END IF;
END $$;
