-- Mass Update Product Images to Placeholders
-- Run this script in your Supabase SQL Editor

-- 1. Ready To Eat (Portrait)
UPDATE public.products
SET 
    showcase_image = './images/placeholder-product-portrait.jpg',
    info_image = './images/placeholder-product-portrait.jpg'
WHERE product_category ILIKE 'Ready To Eat%';

-- 2. Ready To Use (Portrait)
UPDATE public.products
SET 
    showcase_image = './images/placeholder-product-portrait.jpg',
    info_image = './images/placeholder-product-portrait.jpg'
WHERE product_category ILIKE 'Ready To Use%';

-- 3. Ready To Cook (Landscape)
UPDATE public.products
SET 
    showcase_image = './images/placeholder-product-landscape.jpg',
    info_image = './images/placeholder-product-landscape.jpg'
WHERE product_category ILIKE 'Ready To Cook%';
