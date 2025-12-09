-- Create Testimonials Table
-- (Drop table first to ensure schema update if re-running)
DROP TABLE IF EXISTS public.testimonials;

CREATE TABLE public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    message TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT true,
    testimonial_date DATE DEFAULT CURRENT_DATE,
    product_name TEXT
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public Read Access" ON public.testimonials;
CREATE POLICY "Public Read Access" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Insert Access" ON public.testimonials;
CREATE POLICY "Admin Insert Access" ON public.testimonials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access" ON public.testimonials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access" ON public.testimonials FOR DELETE USING (auth.role() = 'authenticated');

-- Seed Data (from website)
INSERT INTO public.testimonials (name, location, message, rating, is_featured, testimonial_date, product_name)
VALUES 
(
    'Priya Sharma', 
    'Hyderabad', 
    'The best Telugu Podis I''ve tasted outside of my grandmother''s kitchen! The authentic flavors bring back memories of home.',
    5,
    true,
    '2023-10-15',
    'Assorted Podis'
),
(
    'Rajesh Kumar', 
    'Bangalore', 
    'Finally found Parotas that taste just like the ones from Kerala! Perfectly flaky and delicious every time.',
    5,
    true,
    '2023-11-20',
    'Malabar Parota'
),
(
    'Meera Reddy', 
    'Chennai', 
    'The convenience of ready-to-cook Chapathis without compromising on taste. My family loves them!',
    5,
    true,
    '2023-12-05',
    'Wheat Chapathi'
);
