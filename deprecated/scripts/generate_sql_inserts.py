import csv
import re
import os

def generate_sql():
    csv_path = r"f:\WebsiteWithAdmin\Data for Catalogue\master_product_data_v2.csv"
    sql_out_path = r"f:\WebsiteWithAdmin\CurrentSQLFiles\seed_catalogue_products.sql"
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    cols = [
        'product_name', 'product_name_telugu', 'catalogue_category', 'product_category',
        'descriptor', 'product_tagline', 'product_description', 'ingredients',
        'hero_ingredient_1', 'hero_ingredient_2', 'hero_ingredient_3', 'serving_suggestion',
        'serving_size_g', 'shelf_life_days', 'is_veg', 'contains_nuts', 'is_jain', 'is_vegan',
        'webpage_url', 'nutrition_serving_size', 'nutrition_calories', 'nutrition_protein',
        'nutrition_total_fat', 'nutrition_saturated_fat', 'nutrition_carbs', 'nutrition_fiber',
        'nutrition_sugars', 'nutrition_sodium', 'price_100g_standup', 'price_250g_standup',
        'price_500g_pouch', 'price_1kg_pouch', 'price_100g_glass_jar', 'price_one_unit_pouch',
        'photo_standup_pouch', 'photo_glass_jar', 'Category_Colour'
    ]
    
    def escape_str(val):
        if val is None or val.strip() == '' or val.strip() == '-':
            return 'NULL'
        val_clean = val.replace("'", "''")
        return f"'{val_clean}'"
        
    def escape_int(val):
        if val is None or val.strip() == '' or val.strip() == '-':
            return 'NULL'
        try:
            return str(int(float(val)))
        except ValueError:
            return 'NULL'
            
    def escape_numeric(val):
        if val is None or val.strip() == '' or val.strip() == '-':
            return 'NULL'
        try:
            return str(float(val))
        except ValueError:
            return 'NULL'

    sql_statements = []
    sql_statements.append("-- ============================================")
    sql_statements.append("-- Seed Data for catalogue_products table")
    sql_statements.append("-- ============================================\n")
    sql_statements.append("TRUNCATE TABLE catalogue_products;\n")
    
    for row in rows:
        vals = []
        for col in cols:
            val = row.get(col, '')
            # Handle special header casing if needed
            if col == 'photo_standup_pouch' and 'photo_standup_pouch' not in row:
                val = row.get('photo_standup_pouch', '')
            if col == 'photo_glass_jar' and 'photo_glass_jar' not in row:
                val = row.get('photo_glass_jar', '')
            
            # Map types
            if col in ['serving_size_g', 'shelf_life_days']:
                vals.append(escape_int(val))
            elif col in ['price_100g_standup', 'price_250g_standup', 'price_500g_pouch', 'price_1kg_pouch', 'price_100g_glass_jar', 'price_one_unit_pouch']:
                vals.append(escape_numeric(val))
            else:
                vals.append(escape_str(val))
                
        col_names = ", ".join(cols)
        val_str = ", ".join(vals)
        sql_statements.append(f"INSERT INTO catalogue_products ({col_names}) VALUES ({val_str});")
        
    with open(sql_out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated SQL seed file at: {sql_out_path}")

if __name__ == "__main__":
    generate_sql()
