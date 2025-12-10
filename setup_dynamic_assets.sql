-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_title TEXT DEFAULT 'Telugu Delicacies',
    logo_url TEXT,
    fav_icon_url TEXT,
    hero_title TEXT DEFAULT 'Modern Yet Traditional',
    hero_subtitle TEXT DEFAULT 'Timeless tradition, created for today.',
    hero_telugu_subtitle TEXT DEFAULT 'సాంప్రదాయ రుచులు, ఆధునిక శైలి',
    hero_background_url TEXT,
    contact_email TEXT DEFAULT 'info@telugudelicacies.com',
    contact_phone_primary TEXT DEFAULT '+91 96767 12031',
    contact_phone_secondary TEXT DEFAULT '+91 96185 13131',
    address_line1 TEXT DEFAULT 'II, Western Part, Plot No: 121/3',
    address_line2 TEXT DEFAULT 'B N Reddy Nagar, Cherlapalli, Hyderabad, Telangana 500051',
    map_embed_url TEXT,
    product_placeholder_url TEXT
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    telugu_title TEXT,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0
);

-- 3. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for site_settings
CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON public.site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Create Policies for categories
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Create Storage Bucket for Site Assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING ( bucket_id = 'site-assets' );
CREATE POLICY "Authenticated Upload Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'site-assets' );
CREATE POLICY "Authenticated Update/Delete Assets" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'site-assets' );
CREATE POLICY "Authenticated Delete Assets" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'site-assets' );


-- 8. Seed Initial Data (if empty)
INSERT INTO public.site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Seed Categories (Idempotent)
INSERT INTO public.categories (title, slug, telugu_title, description, display_order)
VALUES 
('Ready To Eat', 'ready-to-eat', 'పచ్చళ్ళు - పొడులు', 'Authentic Traditional Telugu Spice Powders – Perfectly prepared to complement rice, idli, or dosa.', 1),
('Ready To Cook', 'ready-to-cook', 'మీ సౌకర్యం, త్వరితగతి కోసం', 'Fresh, Ready-to-Cook Malabar Parota and Wheat Chapathi – Expertly prepared for your convenience.', 2),
('Ready To Use', 'ready-to-use', 'నేరుగా వాడుకోవడానికి అనువైనవి', 'Premium Culinary Essentials – Carefully selected to enhance your everyday cooking.', 3)
ON CONFLICT (slug) DO NOTHING;
