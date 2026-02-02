-- =============================================
-- Migration: Add packaging_type column to combo_items
-- Run this if combo_items table already exists
-- =============================================

-- Add packaging_type column if it doesn't exist
ALTER TABLE public.combo_items 
ADD COLUMN IF NOT EXISTS packaging_type TEXT DEFAULT '';

-- That's it! The column is now available for storing pack type (Pouch, Glass Jar, etc.)
