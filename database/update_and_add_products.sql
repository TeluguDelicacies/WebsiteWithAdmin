-- =============================================================================
-- SQL Migration: Rename Spelling/Name Mismatches and Add Missing Products
-- Run this script directly in your Supabase SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Rename Existing Products & Update Slugs
-- -----------------------------------------------------------------------------

-- Rename Godhuma Kaaram to Special Godhuma Kaaram
UPDATE public.products 
SET 
    product_name = 'Special Godhuma Kaaram', 
    slug = 'special-godhuma-kaaram',
    product_name_telugu = 'స్పెషల్ గోధుమ కారం'
WHERE id = '2cf104b5-c88f-48a7-9e5e-741a20cc2c20' OR product_name = 'Godhuma Kaaram';

-- Rename Idli Podi to Karnataka Idli Podi
UPDATE public.products 
SET 
    product_name = 'Karnataka Idli Podi', 
    slug = 'karnataka-idli-podi',
    product_name_telugu = 'కర్ణాటక ఇడ్లీ పొడి'
WHERE id = '38b67b7f-2441-4024-88f1-f3f0c0a29d00' OR product_name = 'Idli Podi';

-- Rename Puri to Poori
UPDATE public.products 
SET 
    product_name = 'Poori', 
    slug = 'poori'
WHERE id = '1b53eba0-1a68-4e3b-80bf-e585ca8e0cdb' OR product_name = 'Puri';


-- -----------------------------------------------------------------------------
-- Step 2: Insert the Remaining 8 Missing Products
-- -----------------------------------------------------------------------------

INSERT INTO public.products (
    product_name, 
    slug, 
    product_category, 
    product_tagline, 
    product_description, 
    mrp, 
    net_weight, 
    total_stock, 
    quantity_variants, 
    is_visible,
    is_trending,
    product_name_telugu
) VALUES 
(
    'Chinthaku Podi', 
    'chinthaku-podi', 
    'ready-to-eat', 
    'Tangy & Zesty Tamarind Leaf Spice', 
    'Traditional Andhra spice powder prepared from sun-dried tamarind leaves, roasted lentils, and dried chilies. Brings a rich, tangy punch to meals.', 
    100, 
    '100gms', 
    100, 
    '[{"quantity":"100gms","mrp":100,"price":80,"stock":100}]'::jsonb, 
    true, 
    false, 
    'చింతాకు పొడి'
),
(
    'Konaseema Kaaram', 
    'konaseema-kaaram', 
    'ready-to-eat', 
    'Rich Coconut & Garlic Fusion', 
    'A signature spice blend inspired by the coastal Konaseema region. Blends dry coconut, garlic, and red chilies for a rich, aromatic flavor.', 
    100, 
    '100gms', 
    100, 
    '[{"quantity":"100gms","mrp":100,"price":80,"stock":100}]'::jsonb, 
    true, 
    false, 
    'కోనసీమ కారం'
),
(
    'Koora Kaaram', 
    'koora-kaaram', 
    'ready-to-eat', 
    'Traditional All-Purpose Curry Podi', 
    'The essential Telugu multi-purpose spice mix used for seasoning daily curries, fries, and gravies. Perfect balance of spices.', 
    100, 
    '100gms', 
    100, 
    '[{"quantity":"100gms","mrp":100,"price":80,"stock":100}]'::jsonb, 
    true, 
    false, 
    'కూర కారం'
),
(
    'Kothimera Kaaram', 
    'kothimera-kaaram', 
    'ready-to-eat', 
    'Fresh Aromatic Coriander Blend', 
    'A vibrant, aromatic spice powder made with fresh sun-dried coriander leaves, roasted dals, and garlic. Earthy and fresh.', 
    100, 
    '100gms', 
    100, 
    '[{"quantity":"100gms","mrp":100,"price":80,"stock":100}]'::jsonb, 
    true, 
    false, 
    'కొత్తిమీర కారం'
),
(
    'Tamalapaaku Kaaram', 
    'tamalapaaku-kaaram', 
    'ready-to-eat', 
    'Aromatic Betel Leaf Herbal Podi', 
    'A unique, health-focused herbal spice powder combining fresh betel leaves (Tamalapaaku) with traditional roasted spices and lentils.', 
    100, 
    '100gms', 
    100, 
    '[{"quantity":"100gms","mrp":100,"price":80,"stock":100}]'::jsonb, 
    true, 
    false, 
    'తమలపాకు కారం'
),
(
    'Rayalaseema Nannari', 
    'rayalaseema-nannari', 
    'ready-to-use', 
    'Traditional Cooling Root Syrup', 
    'Sweet, herbal, and cooling Nannari beverage syrup concentrate made from authentic Rayalaseema sarsaparilla roots. Best mixed with water and fresh lemon.', 
    150, 
    '250ml', 
    50, 
    '[{"quantity":"250ml","mrp":150,"price":120,"stock":50}]'::jsonb, 
    true, 
    false, 
    'రాయలసీమ నన్నారి'
),
(
    'Peri Peri Masala', 
    'peri-peri-masala', 
    'ready-to-use', 
    'Zesty Spicy Seasoning Mix', 
    'A fiery, zesty fusion blend of African bird''s eye chilies, garlic, herbs, and spices. Perfect for fries, chips, and snacks.', 
    75, 
    '50gms', 
    100, 
    '[{"quantity":"50gms","mrp":75,"price":60,"stock":100}]'::jsonb, 
    true, 
    false, 
    'పెరి పెరి మసాలా'
),
(
    'Ragi Chapati', 
    'ragi-chapati', 
    'ready-to-cook', 
    'Nutritious Finger Millet Flatbread', 
    'Healthy, soft chapatis prepared from a nutritious blend of finger millet (Ragi) flour and whole wheat. Ready to cook on the tawa.', 
    70, 
    '5 pcs', 
    100, 
    '[{"quantity":"5 pcs","mrp":70,"price":70,"stock":100}]'::jsonb, 
    true, 
    false, 
    'రాగి చపాతీ'
);
