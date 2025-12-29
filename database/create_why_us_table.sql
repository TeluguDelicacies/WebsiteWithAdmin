-- Add visibility toggle to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS show_why_us BOOLEAN DEFAULT false;

-- Create why_us_features table
CREATE TABLE IF NOT EXISTS why_us_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Ensure RLS is configured if needed (usually public read for website)
ALTER TABLE why_us_features ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on why_us_features" 
ON why_us_features FOR SELECT 
TO public 
USING (true);

-- Allow authenticated (admin) all access
CREATE POLICY "Allow all access for authenticated users on why_us_features" 
ON why_us_features FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
