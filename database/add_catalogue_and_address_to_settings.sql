-- Migration: Add Catalogue Sharing and Address fields to site_settings
-- Created: 2025-12-29

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS catalogue_image_url TEXT,
ADD COLUMN IF NOT EXISTS catalogue_share_message TEXT DEFAULT 'Check out our latest catalogue of delicious treats!',
ADD COLUMN IF NOT EXISTS company_address TEXT;

-- NOTE: Ensure there is at least one row in site_settings to hold these values
-- If the table is empty, you might need to insert an initial row.
