-- Migration: Create website_sections table for controlling section visibility
-- This is a dedicated table for managing which sections appear on the main website
-- ALL DEFAULTS SET TO TRUE (ON)

-- Create the website_sections table
CREATE TABLE IF NOT EXISTS public.website_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Section visibility toggles (ALL defaults: true = visible)
    show_hero_section BOOLEAN DEFAULT true,
    show_product_carousel BOOLEAN DEFAULT true,
    show_collections BOOLEAN DEFAULT true,
    show_quick_layout BOOLEAN DEFAULT true,
    show_testimonials BOOLEAN DEFAULT true,
    show_why_us BOOLEAN DEFAULT true,
    show_contact_form BOOLEAN DEFAULT true,
    show_footer BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Allow public read access" ON public.website_sections;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.website_sections;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.website_sections;

-- Create Policies
CREATE POLICY "Allow public read access" ON public.website_sections FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON public.website_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.website_sections FOR INSERT TO authenticated WITH CHECK (true);

-- Seed with default values (ALL TRUE)
INSERT INTO public.website_sections (
    show_hero_section,
    show_product_carousel,
    show_collections,
    show_quick_layout,
    show_testimonials,
    show_why_us,
    show_contact_form,
    show_footer
) 
SELECT true, true, true, true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.website_sections);

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_sections_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS update_website_sections_timestamp ON public.website_sections;
CREATE TRIGGER update_website_sections_timestamp
    BEFORE UPDATE ON public.website_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_website_sections_timestamp();
