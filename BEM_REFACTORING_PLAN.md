# BEM Refactoring Plan

> **Goal:** Apply BEM (Block Element Modifier) methodology to entire codebase to eliminate specificity wars and remove `!important` usage.

---

## Overview

| Metric | Count |
|--------|-------|
| Total unique class names | 379 |
| HTML files to refactor | 4 (index.html, sales.html, admin.html, legal.html) |
| CSS files to refactor | 6+ |
| Estimated effort | 3-5 days |

---

## BEM Naming Convention

```
.block                    → Component container
.block__element           → Child of component  
.block--modifier          → Variation of component
.block__element--modifier → Variation of child
```

**Examples:**
```css
/* Before */
.card { }
.card .title { }
.card.featured { }

/* After (BEM) */
.product-card { }
.product-card__title { }
.product-card--featured { }
```

---

## Component Groups

### Group 1: Sales Page Components (Priority - Most !important usage)

| ID | Block Name | Current Classes | Status |
|----|------------|-----------------|--------|
| BEM-S-001 | `product-gallery` | .product-gallery, .gallery-inner, .gallery-front, .gallery-back, .main-img | [ ] |
| BEM-S-002 | `product-details` | .product-details, .details-body, .product-title, .telugu-title, .product-tagline | [ ] |
| BEM-S-003 | `price-display` | .price-row, .current-price, .mrp-strike, .discount-badge | [ ] |
| BEM-S-004 | `variant-selector` | .variant-dropdown-wrapper, .variant-trigger, .selection-area | [ ] |
| BEM-S-005 | `add-to-cart` | .add-to-cart-section, .qty-control-lg, .qty-btn-lg, .qty-input-lg, .add-cart-btn | [ ] |
| BEM-S-006 | `info-tabs` | .info-tabs, .info-btns-row, .info-btn, .info-content-wrapper, .info-content-block | [ ] |
| BEM-S-007 | `image-thumbs` | .image-thumbnail-strip, .image-thumb, .thumb-tag | [ ] |
| BEM-S-008 | `breadcrumb` | .breadcrumb-section, .crumbs, .nav-group, .nav-btn-pill | [ ] |
| BEM-S-009 | `sidebar` | .sidebar, .sidebar-section, .sidebar-header | [ ] |
| BEM-S-010 | `product-card` | .product-card, .card-hero-image, .card-body, .card-title | [ ] |

---

### Group 2: Shared/Global Components

| ID | Block Name | Current Classes | Status |
|----|------------|-----------------|--------|
| BEM-G-001 | `site-header` | .header, .sales-header, .logo-section, .brand-name, .nav-btn | [ ] |
| BEM-G-002 | `toast` | .toast-notification (already good) | [ ] |
| BEM-G-003 | `modal` | .modal, .modal-content, .modal-header | [ ] |
| BEM-G-004 | `button` | .btn-add, .btn-save, .btn-cancel, .action-btn-pill | [ ] |
| BEM-G-005 | `form-field` | .form-group, .form-label, .form-input | [ ] |
| BEM-G-006 | `carousel` | .carousel-wrapper, .carousel-item, .carousel-dots | [ ] |
| BEM-G-007 | `lightbox` | #imageLightbox, .lightbox-backdrop, .lightbox-content | [ ] |

---

### Group 3: Index Page Components

| ID | Block Name | Current Classes | Status |
|----|------------|-----------------|--------|
| BEM-I-001 | `hero-section` | .hero, .hero-content, .hero-title | [ ] |
| BEM-I-002 | `features` | .features, .feature-card | [ ] |
| BEM-I-003 | `testimonials` | .testimonials, .testimonial-card | [ ] |
| BEM-I-004 | `contact-form` | .contact-section, .contact-form | [ ] |
| BEM-I-005 | `footer` | .footer, .footer-links | [ ] |

---

### Group 4: Admin Components

| ID | Block Name | Current Classes | Status |
|----|------------|-----------------|--------|
| BEM-A-001 | `admin-nav` | .admin-nav, .nav-btn | [ ] |
| BEM-A-002 | `admin-table` | .admin-table, table rows/cells | [ ] |
| BEM-A-003 | `admin-form` | .admin-form, form fields | [ ] |
| BEM-A-004 | `image-upload` | .bulk-drop-zone, .image-preview | [ ] |
| BEM-A-005 | `login-form` | .login-section, .login-form | [ ] |

---

## Execution Order

**Phase 1: Sales Page (Highest priority - most CSS issues)**
```
BEM-S-001 → BEM-S-002 → BEM-S-003 → BEM-S-004 → BEM-S-005 → BEM-S-006
```

**Phase 2: Shared Components**
```
BEM-G-001 → BEM-G-004 → BEM-G-003 → BEM-G-006
```

**Phase 3: Index Page**
```
BEM-I-001 → BEM-I-002 → BEM-I-003
```

**Phase 4: Admin**
```
BEM-A-001 → BEM-A-002 → BEM-A-003
```

---

## Per-Component Refactor Checklist

For each component (e.g., BEM-S-001):

```markdown
### BEM-S-001: Product Gallery

**Current State:**
- [ ] Document current HTML structure
- [ ] Document current CSS rules
- [ ] Screenshot before state

**Refactor:**
- [ ] Rename HTML classes to BEM
- [ ] Create new isolated CSS block
- [ ] Remove !important declarations
- [ ] Update any JS that references old classes

**Validation:**
- [ ] Visual comparison (screenshot)
- [ ] Test interactions (hover, click, etc.)
- [ ] Test responsive behavior
- [ ] No console errors
```

---

## Files to Modify

| File | Components |
|------|------------|
| `sales.html` | BEM-S-*, BEM-G-* |
| `styles/sales-page/sales-page.base.css` | BEM-S-* base styles |
| `styles/sales-page/sales-page.desktop.css` | BEM-S-* desktop overrides |
| `styles/sales-page/sales-page.mobile.css` | BEM-S-* mobile overrides |
| `styles/sales-page/sales-page.tablet.css` | BEM-S-* tablet overrides |
| `script.js` | Class references for BEM-S-* |
| `index.html` | BEM-I-*, BEM-G-* |
| `styles.css` | BEM-I-*, BEM-G-* |
| `admin.html` | BEM-A-* |
| `admin.js` | Class references for BEM-A-* |

---

## Success Criteria

- [ ] Zero `!important` declarations in new BEM CSS
- [ ] All components visually identical to before
- [ ] All interactive features working
- [ ] Lighthouse scores maintained or improved
- [ ] CSS file size reduced (no duplicate declarations)

---

## Rollback Plan

Each phase will be committed separately. If issues arise:
```bash
git revert <commit-hash>
```

---

## Changelog

| Date | Component | Status |
|------|-----------|--------|
| 2026-01-18 | Plan created | ✅ |
