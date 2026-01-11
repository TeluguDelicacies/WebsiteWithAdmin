-- Migration: Remove legacy showcase_image column from products table
-- This should only be run after verifying that all images have been migrated to the product_images table.

ALTER TABLE products DROP COLUMN IF EXISTS showcase_image;

-- Optional: Also drop info_image if it's no longer used
-- ALTER TABLE products DROP COLUMN IF EXISTS info_image;
