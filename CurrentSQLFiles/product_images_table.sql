-- =============================================
-- Migration: Create product_images table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create product_images table for multi-image support
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups by product
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Enable Row Level Security
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access on product_images"
ON public.product_images
FOR SELECT
USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on product_images"
ON public.product_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update on product_images"
ON public.product_images
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete on product_images"
ON public.product_images
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- Helper function to ensure only one default image per product
-- =============================================
CREATE OR REPLACE FUNCTION ensure_single_default_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this image as default, unset all others for the same product
    IF NEW.is_default = true THEN
        UPDATE public.product_images
        SET is_default = false
        WHERE product_id = NEW.product_id
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default
DROP TRIGGER IF EXISTS trigger_ensure_single_default ON public.product_images;
CREATE TRIGGER trigger_ensure_single_default
    BEFORE INSERT OR UPDATE ON public.product_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_image();
