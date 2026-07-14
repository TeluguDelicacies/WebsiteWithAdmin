import csv

csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"
output_csv_path = r"f:\WebsiteWithAdmin\catalog_products.csv"

# Mapping of database product names to default catalog icon identifiers
ICON_MAPPING = {
    'Avisaginjala Kaaram': 'bowl-seeds',
    'Chinthaku Podi': 'tamarind-leaf',
    'Chutney Premix': 'bowl-chutney',
    'Dosa Kaaram': 'dosa',
    'Kadapa Kaaram': 'chili',
    'Kandi Podi': 'bowl-powder',
    'Karivepaku Podi': 'curry-leaf',
    'Karnataka Idli Podi': 'bowl-powder',
    'Konaseema Kaaram': 'chili',
    'Koora Kaaram': 'garlic',
    'Kothimera Kaaram': 'coriander-leaf',
    'Moringa Kaaram': 'green-leaf',
    'MultiGrain Mix': 'bowl-powder',
    'Nalla Kaaram': 'chili',
    'Palli Kaaram': 'bowl-nuts',
    'Peri Peri Masala': 'chili',
    'Pudina Kaaram': 'mint-leaf',
    'Putnala Podi': 'bowl-powder',
    'Sambar Premix': 'bowl-soup',
    'Special Godhuma Kaaram': 'bowl-powder',
    'Special Palli Kaaram': 'bowl-nuts',
    'Tamalapaaku Kaaram': 'betel-leaf',
    'Velluli Kaaram': 'garlic'
}

# Mapping database name to display name on the catalog
DISPLAY_NAME_MAPPING = {
    'Special Godhuma Kaaram': 'Godhuma Kaaram',
    'Special Palli Kaaram': 'Special Palli Kaaram', # user confirmed it is renamed to Special Palli Kaaram
    'Karnataka Idli Podi': 'Idli Podi',
}

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
fieldnames = ['Product Name', 'Display Name', 'Speciality', 'Standup 100g', 'Standup 250g', 'Glass Jar 100g', 'Icon', 'Is_Visible']
with open(output_csv_path, mode='w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    
    for name in sorted(products.keys()):
        # Exclude Koora Kaaram because it is Hidden/FALSE
        if name == 'Koora Kaaram':
            continue
        # Exclude Peri Peri Masala by default or let's keep it but mark Is_Visible? Let's exclude Peri Peri Masala from Podi & Kaaram catalog unless visible
        if name == 'Peri Peri Masala':
            continue
            
        data = products[name]
        v_100_standup = data['variants'].get(('Standup Pouch', '100g'), '-')
        v_250_standup = data['variants'].get(('Standup Pouch', '250g'), '-')
        
        v_100_glass = '-'
        for (pkg, qty), price in data['variants'].items():
            if 'glass' in pkg.lower() and qty == '100g':
                v_100_glass = price
                break
                
        display_name = DISPLAY_NAME_MAPPING.get(name, name)
        icon = ICON_MAPPING.get(name, 'bowl-powder')
        
        writer.writerow({
            'Product Name': name,
            'Display Name': display_name,
            'Speciality': data['tagline'],
            'Standup 100g': v_100_standup,
            'Standup 250g': v_250_standup,
            'Glass Jar 100g': v_100_glass,
            'Icon': icon,
            'Is_Visible': data['is_visible']
        })

print("Generated catalog CSV at:", output_csv_path)
