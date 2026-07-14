import csv

csv_path = r"f:\WebsiteWithAdmin\NEW Product List\New Porduct List.csv"

matches = []
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        for val in row.values():
            if val and "dhaniya" in val.lower():
                matches.append(row)
                break

print(f"Found {len(matches)} matching rows:")
for row in matches:
    print(f"Product: {row['product_name']} | Packaging: {row['variant_packaging']} | Qty: {row['variant_qty']} | Descriptor: {row.get('Discriptor', '')}")
