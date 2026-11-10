-- =========================================================================
-- Migration: Create Orders Table for WhatsApp & Storefront Order Tracking
-- =========================================================================

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_pincode TEXT,
    delivery_city TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Paid', 'Shipped', 'Delivered', 'Cancelled'
    payment_method TEXT DEFAULT 'WhatsApp / Manual UPI',
    source TEXT DEFAULT 'Storefront',
    notes TEXT,
    raw_message TEXT
);

-- 2. Indexes for fast dashboard filtering & search
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone (public / storefront visitors) to insert orders without auth
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public insert orders'
    ) THEN
        CREATE POLICY "Allow public insert orders" 
        ON public.orders FOR INSERT 
        TO public 
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public read orders'
    ) THEN
        CREATE POLICY "Allow public read orders" 
        ON public.orders FOR SELECT 
        TO public 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow authenticated manage orders'
    ) THEN
        CREATE POLICY "Allow authenticated manage orders" 
        ON public.orders FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;
