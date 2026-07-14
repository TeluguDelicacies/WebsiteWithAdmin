import csv

csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"

new_or_modified = []
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        command = row.get('command', '').strip()
        if command:
            new_or_modified.append({
                'command': command,
                'name': row['product_name'],
                'packaging': row['variant_packaging'],
                'qty': row['variant_qty'],
                'price': row['variant_price']
            })

print("Products with command/updates:")
for item in new_or_modified:
    print(item)
