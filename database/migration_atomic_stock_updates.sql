-- 1. Ensure global_sold tracking column exists (Lifetime)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS global_sold INTEGER DEFAULT 0;

-- 2. Create/Update the RPC function for atomic order processing
-- Tracks both resettable 'current_sold' (for batch) and 'global_sold' (for history)
CREATE OR REPLACE FUNCTION process_order_stock(
    p_product_id UUID,
    p_variant_label TEXT,
    p_qty INTEGER
) RETURNS VOID AS $$
DECLARE
    v_variants JSONB;
    v_new_variants JSONB;
    v_total_stock INTEGER;
BEGIN
    -- 1. Fetch current variants and lock the row for update
    SELECT quantity_variants INTO v_variants
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    -- Requirement check: Ensure variant label is provided if variants exist
    IF v_variants IS NOT NULL AND jsonb_array_length(v_variants) > 0 THEN
        -- Rebuild the variants array with updated stock and bifurcated sold counts
        WITH updated_variants AS (
            SELECT 
                CASE 
                    WHEN (obj->>'quantity') = p_variant_label THEN 
                        obj || jsonb_build_object(
                            'stock', GREATEST(0, (COALESCE((obj->>'stock')::int, 0) - p_qty)),
                            'current_sold', (COALESCE((obj->>'current_sold')::int, 0) + p_qty),
                            'global_sold', (COALESCE((obj->>'global_sold')::int, 0) + p_qty)
                        )
                    ELSE obj 
                END as new_obj
            FROM jsonb_array_elements(v_variants) obj
        )
        SELECT jsonb_agg(new_obj) INTO v_new_variants FROM updated_variants;

        -- 3. Calculate new total_stock from variants
        SELECT SUM(COALESCE((val->>'stock')::int, 0))::int INTO v_total_stock FROM jsonb_array_elements(v_new_variants) val;

        -- 4. Update the product record: Atomic increment/decrement
        UPDATE products
        SET 
            quantity_variants = v_new_variants,
            total_stock = COALESCE(v_total_stock, 0),
            global_sold = COALESCE(global_sold, 0) + p_qty
        WHERE id = p_product_id;
    ELSE
        -- No variants fallback (still tracks at product level)
        UPDATE products
        SET 
            total_stock = GREATEST(0, COALESCE(total_stock, 0) - p_qty),
            global_sold = COALESCE(global_sold, 0) + p_qty
        WHERE id = p_product_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION process_order_stock(UUID, TEXT, INTEGER) TO anon, authenticated;
