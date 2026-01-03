-- Add short_description column to categories table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'short_description') THEN
        ALTER TABLE categories ADD COLUMN short_description TEXT;
    END IF;
END $$;
