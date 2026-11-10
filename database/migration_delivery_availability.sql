-- ====================================================================
-- Migration: Add Delivery Availability Support
-- Description:
-- Allows products to remain active/visible on the website for browsing
-- and customer discovery (ingredients, nutrition, photos), but marks them
-- as paused for home delivery so customers cannot add them to cart.
-- ====================================================================

-- 1. Add is_delivery_available column to products table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_delivery_available'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_delivery_available BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 2. Backfill existing products to TRUE (deliverable)
UPDATE public.products 
SET is_delivery_available = TRUE 
WHERE is_delivery_available IS NULL;

-- 3. Resilient fallback support in site_settings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'undeliverable_product_ids'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN undeliverable_product_ids JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
