# Catalogue Generator Tool

## What is this?
This folder contains the standalone, fully client-side tool used to generate the high-resolution A4 product catalogues (both the "Single" full-menu posters and the "Premium" individual product posters).

The tool relies entirely on JavaScript (`html2canvas`) and runs locally in your browser. It does not require a backend server.

## How it works
1. **`index.html`** is the main UI dashboard. 
2. When you load `index.html` in your browser, it automatically fetches the latest product data from `../Data for Catalogue/master_product_data_v2.csv`.
3. When you select a product and click "Generate Preview", it seamlessly loads the exact HTML template (`premium_catalogue_template.html` or `single_catalogue_template.html`) into a hidden frame, injects the product's details, applies the dynamic SVG borders, and scales the fonts.
4. Clicking "Download PNG" takes an ultra-high-resolution snapshot of that layout and saves it directly to your computer.

## Why is it here?
This tool was created to be kept strictly isolated from the main website codebase (`admin.html`, `sales.html`, etc.). By placing it in its own `Catalogue_Generator` folder, it keeps the main root directory clean while still sitting securely behind your website's primary password authentication wall.
