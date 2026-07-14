import csv

csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"
output_csv_path = r"f:\WebsiteWithAdmin\catalog_products.csv"

# Load the updated product list CSV
products = {}

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['product_name'].strip()
        category = row['product_category'].strip()
        tagline = row['product_tagline'].strip()
        packaging = row['variant_packaging'].strip()
        qty = row['variant_qty'].strip()
        price = row['variant_price'].strip()
        is_visible = row['is_visible'].strip()
        
        # Only process ready-to-eat category (Podis & Premixes)
        if category == 'ready-to-eat':
            if name not in products:
                products[name] = {
                    'tagline': tagline,
                    'is_visible': is_visible,
                    'variants': {}
                }
            products[name]['variants'][(packaging, qty)] = price

# Write to output CSV
fieldnames = ['Podi', 'Speciality', 'Standup_100g', 'Standup_250g', 'Glass_100g', 'Is_Visible']
with open(output_csv_path, mode='w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    
    for name in sorted(products.keys()):
        data = products[name]
        v_100_standup = data['variants'].get(('Standup Pouch', '100g'), '-')
        v_250_standup = data['variants'].get(('Standup Pouch', '250g'), '-')
        
        # Find Glass Jar 100g variant
        v_100_glass = '-'
        for (pkg, qty), price in data['variants'].items():
            if 'glass' in pkg.lower() and qty == '100g':
                v_100_glass = price
                break
                
        writer.writerow({
            'Podi': name,
            'Speciality': data['tagline'],
            'Standup_100g': v_100_standup,
            'Standup_250g': v_250_standup,
            'Glass_100g': v_100_glass,
            'Is_Visible': data['is_visible']
        })

print("Generated CSV at:", output_csv_path)

# Print out the contents of the generated CSV for inspection
with open(output_csv_path, mode='r', encoding='utf-8') as f:
    print(f.read())
