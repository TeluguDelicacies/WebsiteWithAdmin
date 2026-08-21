# Catalogue Generator — 4-Tab Tool Plan

This document outlines the architecture, data-flow, and step-by-step plan for building the comprehensive 4-tab Catalogue Generator dashboard inside this folder.

## The 4 Tabs Overview

1. **Tab 1: Data Manager (Text & Images)**
   - **Text Sub-tab:** Connects directly to Supabase table `catalogue_products` (with fallback to CSV load/edit). Allows inline grid editing, adding new products, and saving directly back to Supabase.
   - **Images Sub-tab:** Handles product and ingredient image mapping, highlights missing assets, and coordinates Cloudinary uploading.
2. **Tab 2: Single Product (Premium Catalogue)**
   - Select a product from the dropdown.
   - Preview the Premium Catalogue template dynamically.
   - Generate and download the pixel-perfect A4 PNG image via `html2canvas`.
3. **Tab 3: All Products (Placeholder)**
   - A placeholder page containing instructions on running the batch Python scripts and linking to the generated PDF.
4. **Tab 4: Nutrition (FSSAI Label)**
   - Select a product from the dropdown.
   - Replicate the exact canvas-drawing logic of the old `generate_labels.cjs` inside the browser's HTML5 Canvas.
   - Preview and download compliant 1080x1080 FSSAI nutrition label PNGs.

---

## Detailed Image Management Plan (Tab 1)

Images are divided into two distinct categories: **Product-Specific Images** (unique to each product) and **Shared Ingredient Images** (generic ingredient cutouts used across multiple products).

### 1. Highlighting Missing Assets
We will implement an **Asset Audit Table** in the Data tab:
- **Visual Status Badges:**
  - 📦 **Pouch Image:** Green badge with filename/URL if set, Red warning badge if missing.
  - 🫙 **Jar Image:** Green badge if set, Red warning badge if missing.
  - 🌶️ **Hero Ingredients:** Lists the 3 ingredients (e.g., `Moringa`, `Garlic`). Each ingredient name is displayed as a badge:
    - **Green Badge:** Ingredient image has been found/uploaded.
    - **Red Badge:** The ingredient is listed, but no image exists (warning you that the template background will be blank for this ingredient).

### 2. Image Categories & Folder Structure in Cloudinary

#### Category A: Product-Specific Images (1-to-1 Mapping)
- **What they are:** Standup pouches and Glass jars (e.g. `Avisaginjala Kaaram_Standup_Pouch.png`).
- **Where they live in Cloudinary:** `catalogue_images/products/`
- **How they are handled:** 
  - Managed directly in the product's editing row or detail view.
  - When you upload, the file is sent to Cloudinary, and the returned URL is immediately saved to the product's `photo_standup_pouch` or `photo_glass_jar` column in Supabase.

#### Category B: Shared Ingredient Images (Many-to-Many Mapping)
- **What they are:** Raw ingredient cutout assets (e.g. `garlic.png`, `flaxseed.png`) used for background decoration.
- **Where they live in Cloudinary:** `catalogue_images/ingredients/`
- **How they are handled:**
  - The UI scans all products' `hero_ingredient_1`, `hero_ingredient_2`, and `hero_ingredient_3` columns to generate a master list of all unique ingredients required (e.g. 15 unique ingredients total).
  - A **Shared Ingredients Library** grid will display all unique ingredients.
  - If a required ingredient (like "Mint Leaves") is missing an image, you can upload it there. The tool will automatically clean the filename (e.g., `mint_leaves.png`), upload it to the `ingredients/` folder in Cloudinary, and register it.
  - Once uploaded, *every* product using "Mint Leaves" as a hero ingredient will instantly get the correct background asset.

---

## Separation of Concerns
- The tool acts as a single-page app (`index.html`) loaded locally or via the admin domain.
- All product data and images reside separately (hosted CSV / Cloudinary / Supabase).
- This keeps the generator isolated from the main customer-facing sales page (`sales.html`, `script.js`).
