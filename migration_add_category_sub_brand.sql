-- Add sub_brand column to categories table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sub_brand') THEN
        ALTER TABLE categories ADD COLUMN sub_brand TEXT;
    END IF;
END $$;
