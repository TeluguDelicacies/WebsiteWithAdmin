-- =============================================================================
-- Migration: Add Guntur Kaaram to Products
-- =============================================================================

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
ON CONFLICT (slug) DO NOTHING;
