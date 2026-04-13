-- Migration: Add Thank You page text fields to site_settings
-- These fields are editable from the admin Settings tab and used on the QR landing page.

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS thankyou_title TEXT DEFAULT 'Thank You for Choosing Us!';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS thankyou_title_telugu TEXT DEFAULT 'మీ విశ్వాసానికి ధన్యవాదాలు';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS thankyou_subtitle TEXT DEFAULT 'Every order means the world to us. We craft each product with love, tradition, and the finest ingredients — just for you.';
