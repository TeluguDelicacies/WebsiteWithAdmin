import csv

processed_csv_path = r"f:\WebsiteWithAdmin\catalog_products_processed.csv"
complete_csv_path = r"f:\WebsiteWithAdmin\catalog_data_complete.csv"

# Read products
products = []
with open(processed_csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        products.append(row)

# Define branding and header/footer metadata
header_rows = [
    ["SECTION", "Key/Display Name", "Value/Speciality", "Standup 100g", "Standup 250g", "Glass Jar 100g", "Icon", "Is_Visible"],
    ["[HEADER]", "", "", "", "", "", "", ""],
    ["Branding Header", "Title", "Telugu Delicacies", "", "", "", "", ""],
    ["Branding Header", "Tagline", "Modern Yet Traditional", "", "", "", "", ""],
    ["Branding Header", "Phone", "Phone: 9618519191", "", "", "", "", ""],
    ["Branding Header", "Title Category", "Podi & Kaaram", "", "", "", "", ""],
    ["Branding Header", "Website URL", "https://telugudelicacies.com", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""]
]

footer_rows = [
    ["", "", "", "", "", "", "", ""],
    ["[FOOTER]", "", "", "", "", "", "", ""],
    ["Branding Footer", "Weight Note", "Net Wt: 100GMs & 250GMs | Other Sizes & Bulk Quantities Available on Request", "", "", "", "", ""],
    ["Branding Footer", "WhatsApp Order", "Order via WhatsApp: +91 96185 19191", "", "", "", "", ""],
    ["Branding Footer", "QR Code Label", "Browse & Order online at: telugudelicacies.com", "", "", "", "", ""]
]

# Write the unified CSV
with open(complete_csv_path, mode='w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    
    # 1. Write Header Metadata
    writer.writerows(header_rows)
    
    # 2. Write Products Section Marker & Header
    writer.writerow(["[PRODUCTS]", "", "", "", "", "", "", ""])
    writer.writerow(["Product Name", "Display Name", "Speciality", "Standup 100g", "Standup 250g", "Glass Jar 100g", "Icon", "Is_Visible"])
    
    # 3. Write Product Rows
    for prod in products:
        writer.writerow([
            prod["Product Name"],
            prod["Display Name"],
            prod["Speciality"],
            prod["Standup 100g"],
            prod["Standup 250g"],
            prod["Glass Jar 100g"],
            prod["Icon"],
            prod["Is_Visible"]
        ])
        
    # 4. Write Footer Metadata
    writer.writerows(footer_rows)

print(f"Successfully compiled and generated complete catalog CSV at: {complete_csv_path}")
