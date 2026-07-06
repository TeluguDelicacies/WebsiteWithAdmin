-- =============================================
-- Migration: Restore Combos Data
-- Clears out existing combos and repopulates them 
-- with updated product names and packaging types.
-- =============================================

-- Clear existing combo data
DELETE FROM public.combos WHERE slug IN ('tiranga', 'panch-pataka', 'rainbow');

-- Insert the three combo offers
INSERT INTO public.combos (name, slug, tagline, discount_percent, display_order, is_active) VALUES
('Tiranga', 'tiranga', 'Three iconic flavors of Andhra', 10, 1, true),
('Panch Pataka', 'panch-pataka', 'Five explosive flavors to ignite your taste buds', 15, 2, true),
('Rainbow', 'rainbow', 'Seven colors of authentic taste', 20, 3, true);

-- Insert combo items for Tiranga (3 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, packaging_type, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram' LIMIT 1), '100g', 'Standup Pouch', 1),
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram' LIMIT 1), '100g', 'Standup Pouch', 2),
((SELECT id FROM public.combos WHERE slug = 'tiranga'), (SELECT id FROM public.products WHERE product_name = 'Special Godhuma Kaaram' LIMIT 1), '100g', 'Standup Pouch', 3);

-- Insert combo items for Panch Pataka (5 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, packaging_type, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram' LIMIT 1), '100g', 'Standup Pouch', 1),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram' LIMIT 1), '100g', 'Standup Pouch', 2),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Special Godhuma Kaaram' LIMIT 1), '100g', 'Standup Pouch', 3),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Velluli Kaaram' LIMIT 1), '100g', 'Standup Pouch', 4),
((SELECT id FROM public.combos WHERE slug = 'panch-pataka'), (SELECT id FROM public.products WHERE product_name = 'Palli Kaaram' LIMIT 1), '100g', 'Standup Pouch', 5);

-- Insert combo items for Rainbow (7 products)
INSERT INTO public.combo_items (combo_id, product_id, variant_quantity, packaging_type, display_order) VALUES
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Kadapa Kaaram' LIMIT 1), '100g', 'Standup Pouch', 1),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Nalla Kaaram' LIMIT 1), '100g', 'Standup Pouch', 2),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Special Godhuma Kaaram' LIMIT 1), '100g', 'Standup Pouch', 3),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Velluli Kaaram' LIMIT 1), '100g', 'Standup Pouch', 4),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Palli Kaaram' LIMIT 1), '100g', 'Standup Pouch', 5),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Avisaginjala Kaaram' LIMIT 1), '100g', 'Standup Pouch', 6),
((SELECT id FROM public.combos WHERE slug = 'rainbow'), (SELECT id FROM public.products WHERE product_name = 'Moringa Kaaram' LIMIT 1), '100g', 'Standup Pouch', 7);
