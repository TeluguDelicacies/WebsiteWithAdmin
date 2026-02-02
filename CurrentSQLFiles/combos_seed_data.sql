-- =============================================
-- SEED DATA: Combo Offers (Run after tables exist)
-- Run this in Supabase SQL Editor
-- =============================================

-- Clear existing combo data (optional - uncomment if needed)
-- DELETE FROM public.combo_items;
-- DELETE FROM public.combos;

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
