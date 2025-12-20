# Telugu Delicacies Website

A modern, dynamic e-commerce website for Telugu Delicacies, built with vanilla JavaScript and Supabase. Features dual layout modes (Official Brand & Quick Commerce), a comprehensive Admin Panel, and a responsive mobile-first design.

## 🌟 Key Features

### 🛍️ Dual Layout Modes
- **Brand Mode**: Traditional landing page focusing on storytelling and brand identity.
- **Quick Commerce Mode**: High-efficiency, grocery-app style interface optimized for fast purchasing (toggable via Admin Panel).

### 📱 Responsive & Mobile-First
- **Mobile Optimized**: Custom navigation and layout adjustments for mobile users.
- **Preloader**: Smooth loading experience preventing Flash of Unstyled Content (FOUC).
- **Touch Controls**: Swipe-able product tickers and interactive category cards.

### ⚙️ Admin Panel (`admin.html`)
- **Product Management**: Add, edit, and delete products dynamically.
- **Category Management**: Organize products into categories with custom images and sub-brands.
- **Site Settings**:
    - Toggle Quick Commerce Layout.
    - Switch Sales Mode / Trending Items.
    - Update Hero content (Title, Subtitle, Images).
    - Manage Contact Info & Social Links.

### �️ Backend (Supabase)
- **Dynamic Content**: All products, categories, and settings are fetched in real-time.
- **Database**: SQL-based architecture with tables for `products`, `categories`, `site_settings`, `testimonials`, etc.

---

## � Quick Start

### Prerequisites
- A **Supabase** project (URL & Anon Key).
- A local web server (e.g., Live Server, Node.js, Python) to avoid CORS issues.

### 1. Database Setup
All SQL schema and migration files are properly organized in the `database/` folder.
1. Run `database/supabase_schema.sql` to create the initial tables.
2. Run other migration files in `database/` as needed to apply updates.
3. Use `database/seed_products.sql` to populate initial test data.

### 2. Configuration
Update `lib/supabase.js` with your credentials:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Running Locally
Using Python:
```bash
python -m http.server 8000
# Open http://localhost:8000
```
Using Node.js:
```bash
npx serve .
```

---

## 📁 File Structure

```
telugu-delicacies-website/
├── database/           # SQL migration and schema files
├── lib/                # Library files (Supabase client)
├── admin.html          # Admin dashboard for management
├── admin.js            # Admin panel logic
├── index.html          # Main public website
├── script.js           # Main website logic (Dynamic fetching, UI toggles)
├── styles.css          # Global styles (CSS Variables, Flex/Grid)
├── sales.html          # Exclusive sales/landing page
```

## 🎨 Customization

### Toggling Layouts
Go to `/admin.html` -> **Settings** tab -> Toggle **"Show Quick Commerce Layout"**.

### Styling
Core styles are defined in `styles.css` using CSS variables:
```css
:root {
  --color-primary-blue: #0077B6;
  --color-secondary-blue: #00B4D8;
  --font-primary: 'Outfit', sans-serif;
  --font-telugu: 'Noto Sans Telugu', sans-serif;
}
```

## 📄 License
Proprietary software for Telugu Delicacies. All rights reserved.
