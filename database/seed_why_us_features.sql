-- Clear existing features
DELETE FROM why_us_features;

-- Using ultra-stable Iconify API URLs for Google Noto Emoji set.
-- These are 100% reliable CDNs and provide a beautiful, consistent Indian-centric aesthetic.
INSERT INTO why_us_features (title, description, image_url, order_index)
VALUES 
(
    'Authentic Tradition', 
    'Recipes passed down through generations, capturing the true essence of Telugu flavor.', 
    'https://api.iconify.design/noto:diya-lamp.svg', 
    1
),
(
    '100% Natural', 
    'No artificial colors, preservatives, or MSG. Pure food for a pure lifestyle.', 
    'https://api.iconify.design/noto:lotus.svg', 
    2
),
(
    'Handcrafted with Love', 
    'Every batch is prepared by hand with the same care you would use in your home kitchen.', 
    'https://api.iconify.design/noto:shallow-pan-of-food.svg', 
    3
),
(
    'Premium Ingredients', 
    'We source only the finest spices and grains to ensure every bite is a celebration of quality.', 
    'https://api.iconify.design/noto:sparkles.svg', 
    4
);

-- Enable the section
UPDATE site_settings SET show_why_us = true;
