import csv

csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"

products = {}

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['product_name']
        category = row['product_category']
        tagline = row['product_tagline']
        packaging = row['variant_packaging'].strip()
        qty = row['variant_qty'].strip()
        price = row['variant_price'].strip()
        is_visible = row['is_visible'].strip()
        
        # We only care about products that are visible (or we want to see everything)
        if name not in products:
            products[name] = {
                'category': category,
                'tagline': tagline,
                'is_visible': is_visible,
                'variants': {}
            }
        
        products[name]['variants'][(packaging, qty)] = price

print("Unique packagings and quantities:")
all_packagings = set()
for name, data in products.items():
    for (pkg, qty) in data['variants'].keys():
        all_packagings.add(f"{pkg} - {qty}")
for item in sorted(all_packagings):
    print(f"  {item}")

print("\nDetail list of Podi & Kaaram products:")
podi_categories = ['ready-to-eat'] # standard category for podis in this codebase?
for name, data in sorted(products.items()):
    # let's look at all variants
    v_100_standup = data['variants'].get(('Standup Pouch', '100g'), '-')
    v_250_standup = data['variants'].get(('Standup Pouch', '250g'), '-')
    # Check other glass variants (glass jar, glass bottle, etc. of 100g)
    v_100_glass = '-'
    for (pkg, qty), price in data['variants'].items():
        if 'glass' in pkg.lower() and qty == '100g':
            v_100_glass = price
            break
            
    print(f"Product: {name} | Category: {data['category']} | Visible: {data['is_visible']}")
    print(f"  Tagline: {data['tagline']}")
    print(f"  Standup 100g: {v_100_standup} | Standup 250g: {v_250_standup} | Glass 100g: {v_100_glass}")
    print(f"  All raw variants: {data['variants']}")
    print("-" * 50)
