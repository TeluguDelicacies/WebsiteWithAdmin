-- Migration: Add slug column to products table
-- Run this in Supabase SQL Editor

-- 1. Add the slug column (nullable initially)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create a helper function to generate slugs
CREATE OR REPLACE FUNCTION generate_product_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(name),
                '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special chars
            ),
            '\s+', '-', 'g'  -- Replace spaces with hyphens
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Populate slugs for existing products
UPDATE public.products 
SET slug = generate_product_slug(product_name)
WHERE slug IS NULL;

-- 4. Handle duplicates by appending suffix
DO $$
DECLARE
    dup RECORD;
    counter INT;
    new_slug TEXT;
BEGIN
    FOR dup IN (
        SELECT slug, array_agg(id ORDER BY created_at) as ids
        FROM products
        GROUP BY slug
        HAVING COUNT(*) > 1
    ) LOOP
        counter := 1;
        FOR i IN 2..array_length(dup.ids, 1) LOOP
            counter := counter + 1;
            new_slug := dup.slug || '-' || counter;
            UPDATE products SET slug = new_slug WHERE id = dup.ids[i];
        END LOOP;
    END LOOP;
END $$;

-- 5. Add unique constraint and make NOT NULL
ALTER TABLE public.products 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.products 
ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- 6. Clean up helper function (optional, keep if you want to use it in triggers)
-- DROP FUNCTION IF EXISTS generate_product_slug(TEXT);
