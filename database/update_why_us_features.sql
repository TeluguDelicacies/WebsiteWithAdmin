-- ============================================
-- Why Us Features - FIXED Icons & Updated Content
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Uses reliable Iconify API URLs that are confirmed working

-- Clear existing features
DELETE FROM why_us_features;

-- Insert updated features with FIXED icons and 10-word descriptions
INSERT INTO why_us_features (title, description, image_url, order_index)
VALUES 
(
    'Family Recipes', 
    'Treasured Telugu recipes passed down through generations, bringing authentic home flavors.', 
    'https://api.iconify.design/fluent-emoji-flat:house-with-garden.svg', 
    1
),
(
    'Pure & Natural', 
    'No preservatives, no MSG, no artificial colors. Just pure, real food.', 
    'https://api.iconify.design/fluent-emoji-flat:herb.svg', 
    2
),
(
    'Made by Hand', 
    'Every batch is lovingly crafted by hand in our small kitchen.', 
    'https://api.iconify.design/fluent-emoji-flat:palms-up-together.svg', 
    3
),
(
    'Premium Quality', 
    'We source only the finest spices and ingredients for every product.', 
    'https://api.iconify.design/fluent-emoji-flat:star.svg', 
    4
);

-- Ensure the section is enabled
UPDATE site_settings SET show_why_us = true;

-- Verify the update
SELECT id, title, description, image_url, order_index FROM why_us_features ORDER BY order_index;
