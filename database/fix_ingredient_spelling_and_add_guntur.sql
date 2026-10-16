-- =============================================================================
-- SQL Migration: Fix Ingredient Spelling, Text Typos, Placeholders & Add Guntur Kaaram
-- Execute this script directly in the Supabase SQL Editor.
-- =============================================================================

-- 1. Fix 'Samolina' -> 'Semolina' in Poori ingredients
UPDATE public.products
SET 
    ingredients = 'Poori Atta, Chakki Atta, Semolina, Water, Salt, Sunflower Oil',
    serving_suggestion = COALESCE(NULLIF(serving_suggestion, ''), 'Fry in hot oil until fully puffed and golden brown, or heat on a preheated tawa. Serve hot with your favorite curry or sagu.')
WHERE slug = 'poori' OR product_name = 'Poori';

-- 2. Standardize 'Fresh Mint' -> 'Mint Leaves' & replace 'Place Holder' in Konaseema Kaaram
UPDATE public.products
SET 
    ingredients = 'Curry Leaf, Flax Seed, Peanuts, Moringa, Dry Red Chilly, Chickpea, Coriander, Raisin, Mint Leaves, Tamarind, Urad Dal, White Sesame Seeds, Salt, Ginger, Asafoetida',
    serving_suggestion = 'Mix this coastal specialty of curry leaves, moringa, roasted peanuts, and seeds into warm rice with a generous spoonful of ghee for a wholesome meal.'
WHERE slug = 'konaseema-kaaram' OR product_name = 'Konaseema Kaaram';

-- 3. Fix '[Ingredient 1]' template placeholder in Dosa Kaaram serving suggestion
UPDATE public.products
SET 
    serving_suggestion = 'Evenly dust this vibrant mix of roasted lentils and spices onto your roasting dosa. Finish with a touch of ghee for a spicy, flavorful bite.'
WHERE slug = 'dosa-kaaram' OR product_name = 'Dosa Kaaram';

-- 4. Fix Kandi Podi tagline punctuation (',.') and restore authentic lentil description
UPDATE public.products
SET 
    product_tagline = 'Roasted Lentils, Pure Comfort!',
    product_description = 'A comforting Andhra classic crafted from roasted lentils, cumin, garlic, and hing. Earthy and nourishing, best enjoyed mixed into piping hot rice with a dollop of ghee.'
WHERE slug = 'kandi-podi' OR product_name = 'Kandi Podi';

-- 5. Fix Karivepaku Podi tagline spacing ('Earthy.Spicy.' -> 'Earthy. Spicy.')
UPDATE public.products
SET 
    product_tagline = 'Earthy. Spicy. Naturally Good!'
WHERE slug = 'karivepaku-podi' OR product_name = 'Karivepaku Podi';

-- 6. Add Guntur Kaaram (with identical variant pricing to Velluli Kaaram)
INSERT INTO public.products (
    product_name,
    product_name_telugu,
    product_category,
    slug,
    product_tagline,
    discriptor,
    product_description,
    ingredients,
    serving_suggestion,
    shelf_life,
    is_refrigerated,
    is_visible,
    is_trending,
    total_stock,
    mrp,
    net_weight,
    nutrition_info,
    quantity_variants
) VALUES (
    'Guntur Kaaram',
    'గుంటూరు కారం',
    'ready-to-eat',
    'guntur-kaaram',
    'Andhra''s Favorite Podi!',
    'Guntur Style Idli Podi',
    'A fiery, authentic Andhra specialty crafted with premium sun-dried Guntur chillies, garlic, and roasted lentils. Bold, aromatic, and deeply flavorful, it is the quintessential idli & dosa podi.',
    'Dry Red Chilly, Garlic, Tamarind, Urad Dal, Salt, Coriander, Cumin, Fenugreek',
    'Mix this classic blend of roasted chillies and garlic with a generous spoonful of ghee. Spread it right on top for a perfect bite!',
    90,
    false,
    true,
    true,
    500,
    60,
    '100g',
    '{"serving_size": "5g", "total_servings": "20", "calories": "11.76kcal", "protein": "0.49g", "total_fat": "0.32g", "saturated_fat": "0.05g", "carbs": "2.33g", "fiber": "0.93g", "sugars": "0.56g", "sodium": "0.17g"}'::jsonb,
    '[
      {"quantity": "100g", "price": 60, "mrp": 60, "stock": 100, "packaging_type": "Standup Pouch"},
      {"quantity": "250g", "price": 145, "mrp": 145, "stock": 100, "packaging_type": "Standup Pouch"},
      {"quantity": "500g", "price": 280, "mrp": 280, "stock": 100, "packaging_type": "Pouch"},
      {"quantity": "1000g", "price": 540, "mrp": 540, "stock": 100, "packaging_type": "Pouch"},
      {"quantity": "100g", "price": 110, "mrp": 110, "stock": 100, "packaging_type": "Glass Jar"}
    ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    ingredients = EXCLUDED.ingredients,
    serving_suggestion = EXCLUDED.serving_suggestion,
    product_tagline = EXCLUDED.product_tagline,
    discriptor = EXCLUDED.discriptor,
    product_description = EXCLUDED.product_description,
    nutrition_info = EXCLUDED.nutrition_info,
    quantity_variants = EXCLUDED.quantity_variants;
