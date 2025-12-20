-- Add display_order column to products table
ALTER TABLE public.products 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Optional: Update existing products to have a default order if needed
-- UPDATE public.products SET display_order = 0;
