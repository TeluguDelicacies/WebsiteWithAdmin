-- Add display_order column to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Optional: Update existing testimonials to have a default order
-- UPDATE public.testimonials SET display_order = 0;
