-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    product_description TEXT,
    product_tagline TEXT,
    showcase_image TEXT,
    info_image TEXT,
    mrp NUMERIC,
    net_weight TEXT,
    total_stock INTEGER DEFAULT 0,
    quantity_variants JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow public read access
CREATE POLICY "Allow public read access" 
ON public.products 
FOR SELECT 
USING (true);

-- Create Policy: Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (true);

-- Create Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Storage Policy: Allow public to view images
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Storage Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'product-images' );

-- Storage Policy: Allow authenticated users to update/delete images
CREATE POLICY "Authenticated Update/Delete" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Authenticated Delete" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING ( bucket_id = 'product-images' );
