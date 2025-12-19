-- Migration to update 'quantity_variants' for Ready to Eat products
-- Added stock quantities: 100gms -> 100, 250gms -> 20, 500gms -> 20

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "175", "mrp": "185", "stock": 20},
    {"quantity": "500gms", "price": "325", "mrp": "335", "stock": 20}
]' WHERE product_name = 'Kadapa Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Nalla Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Godhuma Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "175", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "325", "mrp": "335", "stock": 20}
]' WHERE product_name = 'Velluli Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "72", "mrp": "90", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Palli Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "72", "mrp": "90", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Avisaginjala Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "175", "mrp": "185", "stock": 20},
    {"quantity": "500gms", "price": "325", "mrp": "335", "stock": 20}
]' WHERE product_name = 'Moringa Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "175", "mrp": "185", "stock": 20},
    {"quantity": "500gms", "price": "325", "mrp": "335", "stock": 20}
]' WHERE product_name = 'Pudina Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "72", "mrp": "90", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Dosa Kaaram';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Kandi Podi';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "175", "mrp": "185", "stock": 20},
    {"quantity": "500gms", "price": "325", "mrp": "335", "stock": 20}
]' WHERE product_name = 'Karivepaku Podi';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "80", "mrp": "100", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Palli Dhaniya Podi';

UPDATE products SET quantity_variants = '[
    {"quantity": "100gms", "price": "72", "mrp": "90", "stock": 100},
    {"quantity": "250gms", "price": "160", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "295", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Idli Podi';

-- Premixes (No 100gms, assuming stock 20 for 250g/500g)
UPDATE products SET quantity_variants = '[
    {"quantity": "250gms", "price": "135", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "245", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Sambar Premix';

UPDATE products SET quantity_variants = '[
    {"quantity": "250gms", "price": "110", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "195", "mrp": "315", "stock": 20}
]' WHERE product_name = 'Chutney Premix';

UPDATE products SET quantity_variants = '[
    {"quantity": "250gms", "price": "110", "mrp": "175", "stock": 20},
    {"quantity": "500gms", "price": "195", "mrp": "315", "stock": 20}
]' WHERE product_name = 'MultiGrain Mix';
