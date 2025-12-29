-- SQL Script to auto-populate display_order for products
-- This script groups products by category and assigns a sequential order (1, 2, 3...)
-- for all products based on their existing ID/creation sequence.

WITH OrderedProducts AS (
    SELECT 
        id,
        product_category,
        ROW_NUMBER() OVER (
            PARTITION BY product_category 
            ORDER BY COALESCE(display_order, 0), created_at, id
        ) as new_order
    FROM products
)
UPDATE products
SET display_order = OrderedProducts.new_order
FROM OrderedProducts
WHERE products.id = OrderedProducts.id;

-- Verify results
SELECT product_name, product_category, display_order 
FROM products 
ORDER BY product_category, display_order;
