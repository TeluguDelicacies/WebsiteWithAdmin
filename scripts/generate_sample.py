import os
import subprocess

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_html = os.path.join(base_dir, 'scratch', 'temp_premium.html')
    
    with open(temp_html, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace the border CSS in premium catalogue
    old_border = "border: 12px solid var(--copper-primary);"
    # We will use an absolute path to the SVG so Edge can find it
    svg_path = os.path.join(base_dir, 'assets', 'rangoli_border.svg').replace('\\', '/')
    new_border = f"border: 24px solid transparent; border-image: url('file:///{svg_path}') 30 round;"
    
    html = html.replace(old_border, new_border)
    
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html)
        
    out_img_path = os.path.join(base_dir, 'scratch', 'sample_border.png')
    
    msedge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    file_url = f"file:///{temp_html.replace(chr(92), '/')}"
    
    cmd = [
        msedge_path,
        "--headless",
        f"--screenshot={out_img_path}",
        "--window-size=794,1123",
        file_url
    ]
    
    subprocess.run(cmd, check=True)
    print("Screenshot generated at scratch/sample_border.png")

if __name__ == '__main__':
    main()
