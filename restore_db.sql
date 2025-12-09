-- 1. Re-create Table (if it was deleted)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    product_tagline TEXT,
    product_description TEXT,
    showcase_image TEXT,
    info_image TEXT,
    mrp NUMERIC,
    net_weight TEXT,
    total_stock INTEGER DEFAULT 0,
    quantity_variants JSONB DEFAULT '[]'::jsonb,
    ingredients TEXT,
    nutrition_info JSONB DEFAULT '{}'::jsonb,
    serving_suggestion TEXT,
    product_name_telugu TEXT
);

-- 2. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Drop first to avoid conflicts if they exist from partial runs)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
CREATE POLICY "Enable insert for authenticated users only" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
CREATE POLICY "Enable update for authenticated users only" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
CREATE POLICY "Enable delete for authenticated users only" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Storage Bucket (Safe creation: ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- 5. SEED DATA (Fresh Inserts)
-- Truncate to ensure no duplicates if table existed partially
TRUNCATE TABLE public.products;

INSERT INTO public.products (product_name, product_category, mrp, net_weight, total_stock, product_name_telugu, product_tagline, product_description, ingredients, nutrition_info, serving_suggestion)
VALUES 
(
    'Kadapa Kaaram', 
    'ready-to-use', 
    150, 
    '250g', 
    100, 
    'కడప కారం',
    'Bold flavor, rich and hearty!',
    'A signature Andhra blend that balances peanuts, garlic, and dry coconut with a fiery kick of red chili. Rich, hearty, and versatile — a true taste of Kadapa tradition.',
    'Peanuts, Garlic, Dry Coconut, Cumin, Dry Red Chili, Coriander, Jaggery, Salt, Chili Powder, Curry Leaf, Lemon Salt',
    '{"calories": "20.88 kcal", "protein": "0.7 g", "fat": "1.49 g", "carbs": "1.51 g", "details": "Per 5g serving"}',
    'Steaming hot rice and ghee, or sprinkled over dosa with ghee for an irresistible twist.'
),
(
    'Nalla Kaaram', 
    'ready-to-eat', 
    140, 
    '250g', 
    85,
    'నల్ల కారం',
    'High fiber, gut-friendly spice!',
    'A wholesome Andhra classic made with tamarind, dals, and garlic. High in fiber and flavor, this podi adds a tangy, spicy twist to everyday favorites.',
    'Dry Red Chili, Chickpea, Urad Dal, Tamarind, Garlic, Coriander, Cumin, Salt, Ghee, Ginger, Jaggery, Curry Leaf',
    '{"calories": "14.95 kcal", "protein": "0.63 g", "fat": "0.4 g", "carbs": "2.47 g", "details": "Per 5g serving"}',
    'Sprinkled over hot idlis with ghee or paired with crispy dosas for a flavorful kick.'
),
(
    'Kandi Podi', 
    'ready-to-eat', 
    160, 
    '250g', 
    120,
    'కంది పొడి',
    'Flavor-packed, protein-rich!',
    'A protein-rich lentil blend from Kadapa, combining fried gram, coconut, and garlic for a nutty, savory taste. Traditionally enjoyed with pickle rice and ghee for an extra flavor boost.',
    'Fried Half Gram, Dry Coconut, Garlic, Red Chili Powder, Salt',
    '{"calories": "17.72 kcal", "protein": "0.89 g", "fat": "0.54 g", "carbs": "2.49 g", "details": "Per 5g serving"}',
    'Traditional Kadapa-style pickle rice and ghee, where it amplifies the complex flavors of pickles.'
),
(
    'Palli Kaaram', 
    'ready-to-use', 
    145, 
    '250g', 
    90,
    'పల్లి కారం',
    'Palli Kaaram. Boldly Telugu!',
    'A nutty and spicy Kadapa classic made with peanuts, chili, and curry leaves. A true part of local culture — delicious with rice and ghee.',
    'Peanuts, Red Chili Powder, Curry Leaf, Dry Red Chili, Garlic, Salt, Cumin',
    '{"calories": "25.87 kcal", "protein": "1.24 g", "fat": "2.04 g", "carbs": "1.02 g", "details": "Per 5g serving"}',
    'A spoonful with steaming hot rice — adds bold, nutty, and spicy flavor to each mouthful.'
),
(
    'Karivepaku Podi', 
    'ready-to-eat', 
    155, 
    '250g', 
    60,
    'కరివేపాకు పొడి',
    'Earthy. Spicy. Naturally Good!',
    'A must-try Andhra specialty made with fragrant curry leaves, dals, and spices. Earthy and wholesome, this podi pairs beautifully with hot rice and ghee for a nourishing meal.',
    'Curry Leaf, Garlic, Urad Dal, Dry Red Chili, Chickpea, Coriander, Tamarind, Salt, Cumin, Fenugreek',
    '{"calories": "12.71 kcal", "protein": "0.81 g", "fat": "0.2 g", "carbs": "2.39 g", "details": "Per 5g serving"}',
    'Hot steamed rice drizzled with ghee — the classic way to enjoy this podi.'
),
(
    'Palli Dhaniya Podi', 
    'ready-to-use', 
    150, 
    '250g', 
    75,
    'పల్లి ధనియాల పొడి',
    'Rustic. Rich. Ridiculously Good.',
    'Our best-reviewed podi! A rustic blend of peanuts, coriander, and jaggery that delivers mellow, nutty flavors. Smooth and balanced, it’s even loved by kids when mixed with hot rice and ghee.',
    'Peanuts, Fried Half Gram, Coriander, Jaggery, Dry Red Chili, Salt, Tamarind',
    '{"calories": "19.99 kcal", "protein": "0.87 g", "fat": "1.03 g", "carbs": "2.23 g", "details": "Per 5g serving"}',
    'Hot rice and ghee — a mellow, comforting combination that appeals to all ages.'
),
(
    'Idli Podi', 
    'ready-to-eat', 
    135, 
    '250g', 
    150,
    'ఇడ్లీ పొడి',
    'Idli’s Best Friends: Ghee & Podi!',
    'A classic South Indian podi made with chickpeas, urad dal, and spices. Perfectly balanced for hot idlis with ghee, adding a nutty, mildly spicy flavor every time.',
    'Chickpea, Urad Dal, Dry Red Chili, Cumin, Black Pepper, Salt, Curry Leaf',
    '{"calories": "17.73 kcal", "protein": "1.06 g", "fat": "0.16 g", "carbs": "3 g", "details": "Per 5g serving"}',
    'Sprinkle over hot idlis with ghee for a classic, flavorful experience.'
),
(
    'Dosa Kaaram', 
    'ready-to-eat', 
    145, 
    '250g', 
    110,
    'దోసె కారం',
    'Perfect Spice for Crispy Dosas!',
    'A flavorful podi crafted for crispy dosas. Made with poha, lentils, and aromatic spices, it adds a nutty, spicy kick that enhances every bite with ghee.',
    'Poha, Chickpea, Urad Dal, Coriander, Dry Red Chili, Cumin, Curry Leaf, Salt, Garlic, Marathi Moggu, Cinnamon',
    '{"calories": "16.39 kcal", "protein": "0.69 g", "fat": "0.2 g", "carbs": "3.21 g", "details": "Per 5g serving"}',
    'Sprinkle over hot dosas with ghee for a perfectly spiced, flavorful experience.'
),
(
    'Velluli Kaaram', 
    'ready-to-cook', 
    140, 
    '250g', 
    95,
    'వెల్లుల్లి కారం',
    'Sauté. Sprinkle. Savor Garlic.',
    'A garlicky podi with dry coconut and spices, a staple in every Kadapa household. Adds delicious flavor to sautéed vegetables or can be used as a base for curries.',
    'Dry Coconut, Garlic, Salt, Red Chili Powder, Coriander',
    '{"calories": "21.5 kcal", "protein": "0.36 g", "fat": "1.73 g", "carbs": "1.41 g", "details": "Per 5g serving"}',
    'Sprinkle on sautéed vegetables or use as a base to make curries tastier.'
),
(
    'Avisaginjala Kaaram', 
    'ready-to-eat', 
    160, 
    '250g', 
    80,
    'అవిసెగింజల కారం',
    'Healthy Bite, Enriched with Ragi',
    'A wholesome podi enriched with flax seeds and finger millet (ragi). Nutty, spicy, and lightly sweet, it delivers nutrition and taste in every bite.',
    'Flax Seed, Urad Dal, Peanuts, Finger Millet, Dry Red Chili, Salt, Garlic, Tamarind, Jaggery, Cardamom, Cinnamon, Cloves, Curry Leaf',
    '{"calories": "20.56 kcal", "protein": "0.84 g", "fat": "0.5 g", "carbs": "2.09 g", "details": "Per 5g serving"}',
    'A healthy addition to hot rice or meals — enjoy the nutritional benefits of flax seeds and ragi in a tasty podi.'
),
(
    'Godhuma Kaaram', 
    'ready-to-cook', 
    155, 
    '250g', 
    70,
    'గోధుమ కారం',
    'Bold Flavor, Rich and Hearty',
    'A wholesome, nutty podi made with chakki atta, dals, coconut, and garlic. Perfectly balanced, it brings a bold, hearty flavor to your meals.',
    'Chakki Atta, Urad Dal, Red Chilly Powder, Dry Coconut, Flax Seed, Garlic, Salt',
    '{"calories": "16.96 kcal", "protein": "0.58 g", "fat": "0.3 g", "carbs": "3.01 g", "details": "Per 5g serving"}',
    'Sprinkle over hot idlis or dosas with ghee for a flavorful experience.'
);
