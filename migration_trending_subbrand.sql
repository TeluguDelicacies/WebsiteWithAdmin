-- Migration to add sub_brand_logo_url to categories and is_trending to products

-- Add sub_brand_logo_url column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sub_brand_logo_url TEXT;

-- Add is_trending column to products table with default false
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;
