-- Migration: Add all_products_tagline to site_settings
-- This adds a configurable tagline for the "All Products" page header in the sales view

-- Add the new column
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS all_products_tagline TEXT DEFAULT 'Featuring our premium brands';

-- Update existing row with default value (if column was added and is null)
UPDATE site_settings 
SET all_products_tagline = 'Featuring our premium brands' 
WHERE all_products_tagline IS NULL;
