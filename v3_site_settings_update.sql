-- Add new columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS fssai_number TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS product_placeholder_url TEXT;

-- Update the existing hero description with the default text if it's null
UPDATE public.site_settings 
SET hero_description = 'Every recipe begins by hand—carefully crafted, tested, and refined until it carries both a unique signature and the warmth of familiar flavors that bring you back to childhood kitchens. Made with thoughtfully chosen ingredients and deep care, our products are more than just food—they are moments of comfort, memory, and authenticity, prepared to the highest standards of quality.'
WHERE hero_description IS NULL;
