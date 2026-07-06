-- Fix: Rename "packaging" key to "packaging_type" inside quantity_variants JSONB
-- for all products where the variants use the wrong key name.
-- This ensures the frontend can read variant.packaging_type correctly.

UPDATE public.products
SET quantity_variants = (
    SELECT jsonb_agg(
        CASE 
            WHEN elem ? 'packaging' AND NOT (elem ? 'packaging_type')
            THEN (elem - 'packaging') || jsonb_build_object('packaging_type', elem->>'packaging')
            ELSE elem
        END
    )
    FROM jsonb_array_elements(quantity_variants) AS elem
)
WHERE quantity_variants IS NOT NULL
  AND quantity_variants::text LIKE '%"packaging"%'
  AND quantity_variants::text NOT LIKE '%"packaging_type"%';
