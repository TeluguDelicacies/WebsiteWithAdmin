import csv

master_csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"
user_csv_path = r"f:\WebsiteWithAdmin\catalog_products.csv"

# 1. Parse the user's requested order and any manual edits
requested_order = []
user_edits = {}
in_requested_order = False

with open(user_csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for idx, row in enumerate(reader):
        if not row:
            continue
        
        # Check if we hit the requested order section
        if len(row) > 0 and 'Requested Order' in row[0]:
            in_requested_order = True
            continue
            
        if in_requested_order:
            val = row[0].strip()
            if val:
                requested_order.append(val)
        else:
            # Parse header or data row
            if idx == 0:
                headers = [h.strip() for h in row]
            else:
                if len(row) >= len(headers):
                    data = dict(zip(headers, [val.strip() for val in row]))
                    prod_name = data.get('Product Name')
                    if prod_name:
                        user_edits[prod_name] = data

print("Requested order:", requested_order)
print("Found user edits for products:", list(user_edits.keys()))

# Normalize name mappings to match master product list names
name_mapping = {
    'Chintaku Podi': 'Chinthaku Podi',
    'Spl. Godhuma Kaaram': 'Special Godhuma Kaaram',
    'Peri Peri Powder': 'Peri Peri Masala'
}

# 2. Parse master product prices and details
master_products = {}
with open(master_csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['product_name'].strip()
        category = row['product_category'].strip()
        tagline = row['product_tagline'].strip()
        packaging = row['variant_packaging'].strip()
        qty = row['variant_qty'].strip()
        price = row['variant_price'].strip()
        is_visible = row['is_visible'].strip()
        
        if category == 'ready-to-eat':
            if name not in master_products:
                master_products[name] = {
                    'tagline': tagline,
                    'is_visible': is_visible,
                    'variants': {}
                }
            master_products[name]['variants'][(packaging, qty)] = price

# 3. Build the final ordered list of products
final_products = []
for req_name in requested_order:
    db_name = name_mapping.get(req_name, req_name)
    
    # Get details from master
    master_info = master_products.get(db_name)
    if not master_info:
        print(f"WARNING: '{db_name}' not found in master sheet!")
        continue
        
    # Get user manual edits (like icons, display names)
    user_info = user_edits.get(db_name, {})
    
    # Resolve pricing
    variants = master_info['variants']
    v_100_standup = variants.get(('Standup Pouch', '100g'), '-')
    v_250_standup = variants.get(('Standup Pouch', '250g'), '-')
    
    v_100_glass = '-'
    for (pkg, qty), price in variants.items():
        if 'glass' in pkg.lower() and qty == '100g':
            v_100_glass = price
            break
            
    # Resolve display name
    display_name = user_info.get('Display Name', db_name)
    if req_name == 'Chintaku Podi':
        display_name = 'Chinthaku Podi'
    elif req_name == 'Spl. Godhuma Kaaram':
        display_name = 'Godhuma Kaaram'
    elif req_name == 'Peri Peri Powder':
        display_name = 'Peri Peri Masala'
    elif db_name == 'Karnataka Idli Podi':
        display_name = 'Idli Podi'
        
    # Resolve tagline/speciality
    speciality = user_info.get('Speciality', master_info['tagline'])
    if db_name == 'Kothimera Kaaram':
        speciality = 'Zesty coriander Spark, Freshness in Every Spoon!'
        
    # Resolve icon (use user's custom edit if available)
    default_icon = 'bowl-powder'
    if 'chili' in db_name.lower() or 'kaaram' in db_name.lower():
        default_icon = 'chili'
    elif 'karivepaku' in db_name.lower():
        default_icon = 'curry-leaf'
    elif 'tamalapaaku' in db_name.lower():
        default_icon = 'betel-leaf'
    elif 'velluli' in db_name.lower() or 'koora' in db_name.lower():
        default_icon = 'garlic'
        
    icon = user_info.get('Icon', default_icon)
    
    # Overrides based on user's manual sheet edits
    if db_name == 'Kandi Podi':
        icon = 'Rosted half gram'
    elif db_name == 'Special Palli Kaaram':
        icon = 'coriander seeds'
    elif db_name == 'Palli Kaaram':
        icon = 'bowl-peanuts'
        
    final_products.append({
        'Product Name': db_name,
        'Display Name': display_name,
        'Speciality': speciality,
        'Standup 100g': v_100_standup,
        'Standup 250g': v_250_standup,
        'Glass Jar 100g': v_100_glass,
        'Icon': icon,
        'Is_Visible': master_info['is_visible']
    })

# 4. Write back to catalog_products.csv (overwriting completely)
try:
    with open(user_csv_path, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['Product Name', 'Display Name', 'Speciality', 'Standup 100g', 'Standup 250g', 'Glass Jar 100g', 'Icon', 'Is_Visible'])
        writer.writeheader()
        for prod in final_products:
            writer.writerow(prod)
    print(f"Successfully processed and rewrote {len(final_products)} products to {user_csv_path}")
except PermissionError:
    fallback_path = r"f:\WebsiteWithAdmin\catalog_products_processed.csv"
    with open(fallback_path, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['Product Name', 'Display Name', 'Speciality', 'Standup 100g', 'Standup 250g', 'Glass Jar 100g', 'Icon', 'Is_Visible'])
        writer.writeheader()
        for prod in final_products:
            writer.writerow(prod)
    print(f"ERROR: Permission denied on {user_csv_path}. The file might be open in Excel.")
    print(f"Successfully wrote the output to fallback file: {fallback_path} instead.")
    print("Please CLOSE the CSV in Excel/other programs so we can overwrite it, or rename the fallback file.")
