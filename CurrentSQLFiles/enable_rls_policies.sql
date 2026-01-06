-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Telugu Delicacies Website
-- =====================================================
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run"
--
-- WHAT THIS DOES:
-- ✅ Allows ANYONE (website visitors) to READ data
-- ✅ Allows only AUTHENTICATED users (admins) to INSERT/UPDATE/DELETE
-- ✅ Will NOT break your existing website functionality
--
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================
-- This turns on Row Level Security (currently rows are open to all)

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_us_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- STEP 2: DROP EXISTING POLICIES (if any)
-- =====================================================
-- This prevents "policy already exists" errors if you run this script multiple times

DROP POLICY IF EXISTS "Public read access" ON public.products;
DROP POLICY IF EXISTS "Admin write access" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.categories;
DROP POLICY IF EXISTS "Admin write access" ON public.categories;
DROP POLICY IF EXISTS "Public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Admin write access" ON public.testimonials;
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin write access" ON public.site_settings;
DROP POLICY IF EXISTS "Public read access" ON public.why_us_features;
DROP POLICY IF EXISTS "Admin write access" ON public.why_us_features;
DROP POLICY IF EXISTS "Public read access" ON public.website_sections;
DROP POLICY IF EXISTS "Admin write access" ON public.website_sections;


-- =====================================================
-- STEP 3: CREATE READ POLICIES (Public Access)
-- =====================================================
-- These policies allow ANYONE to read data (SELECT)
-- This is required for your website to display products, categories, etc.

-- Products: Anyone can view products
CREATE POLICY "Public read access"
ON public.products
FOR SELECT
USING (true);

-- Categories: Anyone can view categories
CREATE POLICY "Public read access"
ON public.categories
FOR SELECT
USING (true);

-- Testimonials: Anyone can view testimonials
CREATE POLICY "Public read access"
ON public.testimonials
FOR SELECT
USING (true);

-- Site Settings: Anyone can view site settings (needed for hero, footer, etc.)
CREATE POLICY "Public read access"
ON public.site_settings
FOR SELECT
USING (true);

-- Why Us Features: Anyone can view features
CREATE POLICY "Public read access"
ON public.why_us_features
FOR SELECT
USING (true);

-- Website Sections: Anyone can view website sections
CREATE POLICY "Public read access"
ON public.website_sections
FOR SELECT
USING (true);


-- =====================================================
-- STEP 4: CREATE WRITE POLICIES (Admin Only)
-- =====================================================
-- These policies allow only AUTHENTICATED (logged-in) users to modify data
-- Your admin panel users will be authenticated via Supabase Auth

-- Products: Only authenticated users can insert, update, delete
CREATE POLICY "Admin write access"
ON public.products
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Categories: Only authenticated users can modify
CREATE POLICY "Admin write access"
ON public.categories
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Testimonials: Only authenticated users can modify
CREATE POLICY "Admin write access"
ON public.testimonials
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site Settings: Only authenticated users can modify
CREATE POLICY "Admin write access"
ON public.site_settings
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Why Us Features: Only authenticated users can modify
CREATE POLICY "Admin write access"
ON public.why_us_features
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Website Sections: Only authenticated users can modify
CREATE POLICY "Admin write access"
ON public.website_sections
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =====================================================
-- VERIFICATION QUERY (Optional)
-- =====================================================
-- Run this separately to verify policies are applied:
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
--
-- =====================================================

-- Done! Your website should work exactly as before, but now:
-- ✅ Anonymous visitors can READ all data (website works)
-- ✅ Only logged-in admins can MODIFY data (admin panel works)
-- ❌ Anonymous users CANNOT modify your database (protected!)
