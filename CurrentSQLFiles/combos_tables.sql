-- =============================================
-- Migration: Create combos and combo_items tables
-- Run this in Supabase SQL Editor
-- =============================================

-- Create combos table for combo offer definitions
CREATE TABLE IF NOT EXISTS public.combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                      -- "Tiranga", "Panch Pataka", "Rainbow"
    slug TEXT UNIQUE NOT NULL,               -- "tiranga", "panch-pataka", "rainbow"
    tagline TEXT,                            -- Short marketing text
    description TEXT,                        -- Detailed description
    image_url TEXT,                          -- Combo display image (optional)
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10,  -- 10, 15, 20
    is_active BOOLEAN DEFAULT true,          -- Show/hide on frontend
    display_order INTEGER DEFAULT 0,         -- Sort order
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create combo_items table for products in each combo
CREATE TABLE IF NOT EXISTS public.combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_quantity TEXT DEFAULT '100gms',   -- Weight: 100gms, 250gms, 500gms
    packaging_type TEXT DEFAULT '',           -- Pack type: Pouch, Glass Jar, PET Jar, etc.
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(combo_id, product_id)             -- Prevent duplicate products in same combo
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_combos_is_active ON public.combos(is_active);
CREATE INDEX IF NOT EXISTS idx_combos_display_order ON public.combos(display_order);
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON public.combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_product_id ON public.combo_items(product_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on combos table
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for active combos
CREATE POLICY "Allow public read access on combos"
ON public.combos
FOR SELECT
USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on combos"
ON public.combos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update on combos"
ON public.combos
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete on combos"
ON public.combos
FOR DELETE
TO authenticated
USING (true);

-- Enable RLS on combo_items table
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access on combo_items
CREATE POLICY "Allow public read access on combo_items"
ON public.combo_items
FOR SELECT
USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on combo_items"
ON public.combo_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update on combo_items"
ON public.combo_items
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete on combo_items"
ON public.combo_items
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- TRIGGER: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_combos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_combos_updated_at ON public.combos;
CREATE TRIGGER trigger_combos_updated_at
    BEFORE UPDATE ON public.combos
    FOR EACH ROW
    EXECUTE FUNCTION update_combos_updated_at();

-- =============================================
-- SEED DATA: Initial combo offers
-- =============================================

-- Insert the three combo offers
INSERT INTO public.combos (name, slug, tagline, discount_percent, display_order, is_active) VALUES
('Tiranga', 'tiranga', 'Three iconic flavors of Andhra', 10, 1, true),
('Panch Pataka', 'panch-pataka', 'Five explosive flavors to ignite your taste buds', 15, 2, true),
('Rainbow', 'rainbow', 'Seven colors of authentic taste', 20, 3, true);

-- Insert combo items for Tiranga (3 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram'), '100gms', 1),
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram'), '100gms', 2),
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Godhuma Kaaram'), '100gms', 3);

-- Insert combo items for Panch Pataka (5 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram'), '100gms', 1),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram'), '100gms', 2),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Godhuma Kaaram'), '100gms', 3),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Velluli Kaaram'), '100gms', 4),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Palli Kaaram'), '100gms', 5);

-- Insert combo items for Rainbow (7 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram'), '100gms', 1),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram'), '100gms', 2),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Godhuma Kaaram'), '100gms', 3),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Velluli Kaaram'), '100gms', 4),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Palli Kaaram'), '100gms', 5),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Avisaginjala Kaaram'), '100gms', 6),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Moringa Kaaram'), '100gms', 7);
