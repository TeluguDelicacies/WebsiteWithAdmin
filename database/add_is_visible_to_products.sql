-- Add is_visible column to products table
ALTER TABLE public.products
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;

-- Set all existing products to visible
UPDATE public.products SET is_visible = TRUE WHERE is_visible IS NULL;
