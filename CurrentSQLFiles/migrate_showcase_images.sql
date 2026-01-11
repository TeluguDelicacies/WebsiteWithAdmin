-- Migration: Copy existing showcase_image from products to product_images table
-- Run this AFTER creating the product_images table (product_images_table.sql)
-- This will migrate legacy single images to the new multi-image system

-- Insert existing showcase images as default images
INSERT INTO product_images (product_id, image_url, is_default, tags, display_order)
SELECT 
    id as product_id,
    showcase_image as image_url,
    true as is_default,
    ARRAY[]::TEXT[] as tags,
    0 as display_order
FROM products
WHERE showcase_image IS NOT NULL 
  AND showcase_image != ''
  -- Only insert if this specific image URL is not already in product_images for this product
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi 
    WHERE pi.product_id = products.id 
    AND pi.image_url = products.showcase_image
  );

-- Output: Shows how many images were migrated
-- Run SELECT statement separately to check results:
-- SELECT COUNT(*) as migrated_count FROM product_images WHERE tags = ARRAY[]::TEXT[];
