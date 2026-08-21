import os
import subprocess
import json

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_path = os.path.join(base_dir, 'Data for Catalogue', 'single_catalogue_template.html')
    
    with open(template_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Dummy data
    dummy_categories = [
        {
            "name": "General",
            "products": [
                {"product_name": "Product 1", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"},
                {"product_name": "Product 2", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"},
                {"product_name": "Product 3", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"}
            ]
        },
        {
            "name": "Nutty",
            "products": [
                {"product_name": "Nutty 1", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"},
                {"product_name": "Nutty 2", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"}
            ]
        },
        {
            "name": "Leafy",
            "products": [
                {"product_name": "Leafy 1", "product_tagline": "Tagline", "price_100g_standup": "100", "price_250g_standup": "200"}
            ]
        }
    ]
    
    dummy_bgs = []
    
    injected_script = f"""
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            const cats = {json.dumps(dummy_categories)};
            const bgs = {json.dumps(dummy_bgs)};
            window.loadCatalogue(cats, bgs);
        }});
    </script>
    """
    
    html = html.replace('</body>', injected_script + '\n</body>')
    
    temp_html = os.path.join(base_dir, 'scratch', 'temp_single.html')
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html)
        
    out_img_path = os.path.join(base_dir, 'scratch', 'sample_single_layout.png')
    
    msedge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    file_url = f"file:///{temp_html.replace(chr(92), '/')}"
    
    cmd = [
        msedge_path,
        "--headless",
        f"--screenshot={out_img_path}",
        "--window-size=1080,1920",
        file_url
    ]
    
    subprocess.run(cmd, check=True)
    print("Screenshot generated at scratch/sample_single_layout.png")

if __name__ == '__main__':
    main()
