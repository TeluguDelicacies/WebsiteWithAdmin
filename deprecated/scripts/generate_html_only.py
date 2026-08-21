import csv
import json
import os
import random
import subprocess

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'Data for Catalogue')
    csv_path = os.path.join(data_dir, 'master_product_data_v2.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        products = []
        for row in reader:
            if row.get('product_name'):
                p = dict(row)
                p['photo_standup'] = p.get('photo_standup_pouch', '')
                p['photo_jar'] = p.get('photo_cylindrical_glass_jar', '')
                p['photo_1kg'] = p.get('photo_1kg_pouch', '')
                p['photo_one_unit'] = p.get('photo_one_unit_pouch', '')
                
                if p['product_name'] == 'Karivepaku Podi':
                    p['photo_standup'] = 'Karivepaku Podi_Standup_Pouch.png'
                    p['photo_jar'] = 'Karivepaku Podi_Cylindrical_Glass_Jar.png'
                if p['product_name'] == 'Palli Kaaram':
                    p['photo_standup'] = 'Palli Kaaram_Standup_Pouch.png'
                    p['photo_jar'] = 'Palli Kaaram_Cylindrical_Glass_Jar.png'
                
                products.append(p)

    category_order = [
        'General', 'Nutty', 'Leafy', 'Sprinkling', 'Healthy', 'Tasty Pinch', 'Ready to Cook', 'Ready To Cook'
    ]
    
    grouped = {}
    for p in products:
        cat = p.get('catalogue_category', 'Uncategorized')
        if cat == 'Ready To Cook':
            cat = 'Ready to Cook'
        grouped.setdefault(cat, []).append(p)
        
    categories = []
    for cat in category_order:
        if cat in grouped:
            categories.append({"name": cat, "products": grouped.pop(cat)})
            
    for cat, prods in grouped.items():
        categories.append({"name": cat, "products": prods})
        
    ing_dir = os.path.join(data_dir, 'Ingredient Images')
    all_ing_images = []
    if os.path.exists(ing_dir):
        all_ing_images = [f for f in os.listdir(ing_dir) if f.endswith('.png') or f.endswith('.jpg')]
        
    random.shuffle(all_ing_images)
    bg_images = all_ing_images[:40]
    
    template_path = os.path.join(data_dir, 'single_catalogue_template.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    script_to_inject = f"""
    <script>
        window.addEventListener('DOMContentLoaded', (event) => {{
            window.loadCatalogue({json.dumps(categories)}, {json.dumps(bg_images)});
        }});
    </script>
    </body>
    </html>
    """
    
    html_content = html_content.replace('</body>', script_to_inject).replace('</html>', '')
    
    out_path = os.path.join(data_dir, 'temp_filled.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Successfully generated temp filled html: {out_path}")
    
    out_dir = os.path.join(base_dir, 'output_catalogues')
    os.makedirs(out_dir, exist_ok=True)
    out_img_path = os.path.join(out_dir, 'TeluguDelicacies_Single_Catalogue.png')
    
    msedge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    file_url = f"file:///{out_path.replace(chr(92), '/')}"
    
    cmd = [
        msedge_path,
        "--headless",
        f"--screenshot={out_img_path}",
        "--window-size=1080,1920",
        file_url
    ]
    
    print(f"Running msedge to capture screenshot...")
    subprocess.run(cmd, check=True)
    print(f"Successfully generated screenshot: {out_img_path}")

if __name__ == '__main__':
    main()
