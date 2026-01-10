-- DEDUPLICATION SCRIPT for product_images table
-- Goal: Remove duplicate image entries for the same product, preserving the ones used in the main 'products' table.

-- 1. Create a temporary table to store IDs of images to KEEP
CREATE TEMP TABLE keep_images AS
SELECT DISTINCT ON (product_id, image_url) id
FROM product_images
ORDER BY 
    product_id, 
    image_url,
    -- Priority 1: Keep if it matches the main products table showcase_image
    (CASE WHEN image_url = (SELECT showcase_image FROM products WHERE id = product_images.product_id) THEN 0 ELSE 1 END),
    -- Priority 2: Keep if it matches the main products table info_image
    (CASE WHEN image_url = (SELECT info_image FROM products WHERE id = product_images.product_id) THEN 0 ELSE 1 END),
    -- Priority 3: Keep the oldest record (first uploaded)
    created_at ASC;

-- 2. Delete images that are NOT in the keep_images table
--    This effectively removes duplicates, keeping only the best single record for each URL per product.
DELETE FROM product_images
WHERE id NOT IN (SELECT id FROM keep_images);

-- 3. Clean up
DROP TABLE keep_images;

-- Output verification
-- SELECT * FROM product_images ORDER BY product_id, created_at;
