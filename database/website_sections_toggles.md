# Website Sections Toggle Documentation

## Overview
This document explains how each section toggle works in the admin panel and what HTML elements are targeted on the main website.

**ALL DEFAULTS ARE SET TO TRUE (ON)**

---

## Database Table: `website_sections`

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| `id` | UUID | auto-generated | Primary key |
| `show_hero_section` | BOOLEAN | **true** | Controls Hero banner visibility |
| `show_product_carousel` | BOOLEAN | **true** | Controls Product ticker/carousel visibility |
| `show_collections` | BOOLEAN | **true** | Controls "Our Collections" category cards visibility |
| `show_quick_layout` | BOOLEAN | **true** | Enables Quick Commerce layout mode |
| `show_testimonials` | BOOLEAN | **true** | Controls Testimonials carousel visibility |
| `show_why_us` | BOOLEAN | **true** | Controls "Why Us" features section visibility |
| `show_contact_form` | BOOLEAN | **true** | Controls "Get In Touch" contact form visibility |
| `show_footer` | BOOLEAN | **true** | Controls Footer visibility |

---

## Toggle Details

### 1. Hero Section
- **Toggle ID in Admin**: `secShowHero`
- **Database Column**: `show_hero_section`
- **Default**: **ON (true)**
- **HTML Target**: `.hero` (CSS class selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_hero_section === false) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) heroSection.style.display = 'none';
}
```

---

### 2. Product Carousel (Ticker)
- **Toggle ID in Admin**: `secShowTicker`
- **Database Column**: `show_product_carousel`
- **Default**: **ON (true)**
- **HTML Target**: `.product-showcase` (CSS class selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_product_carousel === false) {
    const showcaseSection = document.querySelector('.product-showcase');
    if (showcaseSection) showcaseSection.style.display = 'none';
}
```

---

### 3. Our Collections (Product Categories)
- **Toggle ID in Admin**: `secShowCollections`
- **Database Column**: `show_collections`
- **Default**: **ON (true)**
- **HTML Target**: `#product-categories` (ID selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_collections === false) {
    const collectionsSection = document.getElementById('product-categories');
    if (collectionsSection) collectionsSection.style.display = 'none';
}
```

---

### 4. Quick Commerce Layout
- **Toggle ID in Admin**: `secShowQuickLayout`
- **Database Column**: `show_quick_layout`
- **Default**: **ON (true)**
- **HTML Target**: Adds `quick-commerce-mode` class to `<body>`
- **Effect**: Changes header style and collections display to grid layout
- **Logic**: Add class only if explicitly `true`

```javascript
if (data.show_quick_layout === true) {
    document.body.classList.add('quick-commerce-mode');
}
```

---

### 5. Testimonials Carousel
- **Toggle ID in Admin**: `secShowTestimonials`
- **Database Column**: `show_testimonials`
- **Default**: **ON (true)**
- **HTML Target**: `.testimonials-showcase` (CSS class selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_testimonials === false) {
    const testimonialsSection = document.querySelector('.testimonials-showcase');
    if (testimonialsSection) testimonialsSection.style.display = 'none';
}
```

---

### 6. Why Us Section
- **Toggle ID in Admin**: `secShowWhyUs`
- **Database Column**: `show_why_us`
- **Default**: **ON (true)**
- **HTML Target**: `#why-us-section` (ID selector)
- **Special Behavior**: When ON, calls `fetchAndRenderWhyUs()` to load content
- **Logic**: Hide only if explicitly `false`, otherwise show and fetch content

```javascript
if (data.show_why_us === false) {
    const section = document.getElementById('why-us-section');
    if (section) section.style.display = 'none';
} else {
    const section = document.getElementById('why-us-section');
    if (section) {
        section.style.display = 'block';
        fetchAndRenderWhyUs();
    }
}
```

---

### 7. Get In Touch (Contact Form)
- **Toggle ID in Admin**: `secShowContact`
- **Database Column**: `show_contact_form`
- **Default**: **ON (true)**
- **HTML Target**: `#contact` (ID selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_contact_form === false) {
    const contactSection = document.getElementById('contact');
    if (contactSection) contactSection.style.display = 'none';
}
```

---

### 8. Footer
- **Toggle ID in Admin**: `secShowFooter`
- **Database Column**: `show_footer`
- **Default**: **ON (true)**
- **HTML Target**: `.footer` (CSS class selector)
- **Logic**: Hide only if explicitly `false`

```javascript
if (data.show_footer === false) {
    const footerSection = document.querySelector('.footer');
    if (footerSection) footerSection.style.display = 'none';
}
```

---

## File Locations

| File | Purpose |
|------|---------|
| `admin.html` | Contains the Website Sections tab UI with toggle switches |
| `admin.js` | Contains `fetchSectionSettings()` and `saveSectionSettings()` functions |
| `script.js` | Contains `fetchWebsiteSections()` that applies visibility on page load |
| `database/migration_add_section_toggles.sql` | SQL to create the `website_sections` table |

---

## HTML Structure Reference (index.html)

```html
<!-- Hero Section -->
<section class="hero">...</section>

<!-- Product Carousel -->
<section class="product-showcase">...</section>

<!-- Our Collections -->
<section id="product-categories" class="section">...</section>

<!-- Testimonials -->
<section class="testimonials-showcase">...</section>

<!-- Why Us -->
<section id="why-us-section" class="section">...</section>

<!-- Get In Touch -->
<section id="contact" class="section contact-form-section">...</section>

<!-- Footer -->
<footer class="footer">...</footer>
```

---

## Admin Panel Toggle IDs

| Section | Toggle Checkbox ID | Default |
|---------|-------------------|---------|
| Hero Section | `secShowHero` | **ON** |
| Product Carousel | `secShowTicker` | **ON** |
| Our Collections | `secShowCollections` | **ON** |
| Quick Commerce Layout | `secShowQuickLayout` | **ON** |
| Testimonials Carousel | `secShowTestimonials` | **ON** |
| Why Us | `secShowWhyUs` | **ON** |
| Get In Touch | `secShowContact` | **ON** |
| Footer | `secShowFooter` | **ON** |

---

## SQL to Run in Supabase

```sql
-- Create the website_sections table
CREATE TABLE IF NOT EXISTS public.website_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    show_hero_section BOOLEAN DEFAULT true,
    show_product_carousel BOOLEAN DEFAULT true,
    show_collections BOOLEAN DEFAULT true,
    show_quick_layout BOOLEAN DEFAULT true,
    show_testimonials BOOLEAN DEFAULT true,
    show_why_us BOOLEAN DEFAULT true,
    show_contact_form BOOLEAN DEFAULT true,
    show_footer BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public read access" ON public.website_sections FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON public.website_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.website_sections FOR INSERT TO authenticated WITH CHECK (true);

-- Seed with ALL TRUE values
INSERT INTO public.website_sections (
    show_hero_section, show_product_carousel, show_collections, 
    show_quick_layout, show_testimonials, show_why_us, 
    show_contact_form, show_footer
) 
SELECT true, true, true, true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.website_sections);
```
