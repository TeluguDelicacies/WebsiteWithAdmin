/*
========================================
TELUGU DELICACIES WEBSITE JAVASCRIPT
/*
========================================
TELUGU DELICACIES WEBSITE JAVASCRIPT
========================================
Author: Telugu Delicacies
Description: Interactive functionality for responsive Telugu Delicacies website
*/

window.td_catalogueFile = null;
const WHATSAPP_NUMBER = '919618519191';
const WHATSAPP_CATALOG_URL = `https://wa.me/c/${WHATSAPP_NUMBER}`;
const WHATSAPP_DESKTOP_URL = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent("Hi! I'd like to place an order.")}`;

/**
 * Optimizes a Cloudinary URL with transformations for faster loading
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - { width, quality, format }
 * @returns {string} - Optimized URL with transformations
 */
function optimizeImage(url, options = {}) {
    if (!url) return url;

    // Only transform Cloudinary URLs
    if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary')) {
        return url;
    }

    const { width = 600, quality = 'auto', format = 'auto' } = options;

    // Check if transformations already exist
    if (url.includes('/upload/w_') || url.includes('/upload/q_') || url.includes('/upload/f_')) {
        return url; // Already optimized
    }

    // Insert transformation parameters before /upload/
    const transformations = `w_${width},q_${quality},f_${format}`;
    return url.replace('/upload/', `/upload/${transformations}/`);
}
window.optimizeImage = optimizeImage;

async function preloadCatalogue() {
    const settings = window.currentSiteSettings || {};
    const catalogueUrl = settings.catalogue_image_url;
    if (!catalogueUrl) return;

    try {
        const response = await fetch(catalogueUrl, { mode: 'cors' });
        const blob = await response.blob();

        // Fixed: Always enforce PNG for Android compatibility
        const mimeType = 'image/png';
        const fileName = 'Telugu_Delicacies_Catalogue.png';

        window.td_catalogueFile = new File([blob], fileName, { type: mimeType });
        console.log('Catalogue pre-loaded successfully (PNG enforced)');
    } catch (err) {
        console.error('Failed to pre-load catalogue:', err);
    }
}

// Cache for the generated share file (avoids regenerating on subsequent clicks)
window.td_generatedShareFile = null;

// GLOBAL SHARE FUNCTION
window.shareCatalogue = async function () {
    const settings = window.currentSiteSettings || {};
    const catalogueUrl = settings.catalogue_image_url;
    const shareMessage = settings.catalogue_share_message || 'Check out our latest catalogue!';

    if (!catalogueUrl) {
        window.showToast('Catalogue is not available at the moment.', 'error');
        return;
    }

    try {
        let fileToShare;

        // --- STEP 1: CHECK CACHE OR GENERATE NEW FILE ---
        if (window.td_generatedShareFile) {
            // Use cached file for instant sharing on subsequent clicks
            fileToShare = window.td_generatedShareFile;
            console.log('Using cached share file');
        } else {
            // Show "Generating..." toast immediately for first-time generation
            window.showToast('Generating catalogue...', 'info');

            // Load source blob (preloaded or fresh fetch)
            let sourceBlob;
            if (window.td_catalogueFile) {
                sourceBlob = window.td_catalogueFile;
            } else {
                // Fetch fresh if needed
                const cleanUrl = catalogueUrl + (catalogueUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
                const response = await fetch(cleanUrl, { mode: 'cors' });
                sourceBlob = await response.blob();
            }

            // Draw to Canvas to create a fresh, clean JPEG file
            const imageBitmap = await createImageBitmap(sourceBlob);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');

            // White background handles transparent PNGs safely
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageBitmap, 0, 0);

            // Convert to JPEG (High Quality) - AWAIT the blob creation fully
            const jpegBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

            // Create the File object with a timestamp (Crucial for Android)
            fileToShare = new File([jpegBlob], 'Telugu_Delicacies_Menu.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            // Cache for future clicks
            window.td_generatedShareFile = fileToShare;
            console.log('Generated and cached share file');
        }

        // --- STEP 2: SHARE (Rules: Mobile=Native, Desktop=Download+Web) ---
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

        // Strict Check: Only attempt native share on actual Mobile devices
        if (isMobile && navigator.share && navigator.canShare({ files: [fileToShare] })) {
            let shareData = { files: [fileToShare] };

            if (isIOS) {
                shareData.text = shareMessage;
            }

            if (/Android/i.test(userAgent) && navigator.clipboard) {
                try { await navigator.clipboard.writeText(shareMessage); } catch (e) { }
            }

            // Ensure file is ready before sharing
            await navigator.share(shareData);
        } else {
            // Force Desktop flow even if navigator.share exists (e.g. Chrome on Windows)
            throw new Error("Switching to Desktop Flow");
        }

    } catch (err) {
        // 1. IGNORE USER CANCELLATION
        // If the user simply closed the share menu, do NOTHING.
        if (err.name === 'AbortError') {
            console.log('User cancelled the share.');
            return;
        }

        console.error('Share failed, switching to fallback:', err);

        // Check device type again for the fallback
        const isMobileFallback = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobileFallback) {
            // --- MOBILE FALLBACK ---
            // Use the "Deep Link" scheme. This tries to force the APP to open directly.
            // It avoids the browser "Download App" landing page.
            window.location.href = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
        }
        else {
            // --- DESKTOP FALLBACK ---
            // 1. Download the image first
            // We use the blob we already created (or the URL) to force a download
            if (window.td_generatedShareFile || window.td_catalogueFile || catalogueUrl) {
                const link = document.createElement('a');
                // Use the generated file, preloaded file, or raw URL
                const fileForDownload = window.td_generatedShareFile || window.td_catalogueFile;
                const blobUrl = fileForDownload
                    ? URL.createObjectURL(fileForDownload)
                    : catalogueUrl;

                link.href = blobUrl;
                link.download = 'Telugu_Delicacies_Catalogue.jpg'; // Force a clean filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the blob URL to free memory
                if (fileForDownload) setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }

            // 2. OPEN WHATSAPP WEB
            // We use 'web.whatsapp.com' to bypass the "Download App" page
            const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
            window.open(whatsappWebUrl, '_blank');
        }
    }
}

// GLOBAL SHARE CURRENT PAGE FUNCTION - Context-aware
window.shareCurrentPage = function () {
    const currentUrl = window.location.href;

    // Detect which section is most visible or use page context
    let shareText = "Check out Telugu Delicacies for authentic South Indian treats! 😋";

    // Check if Quick Commerce mode is active
    const isQuickCommerce = document.body.classList.contains('quick-commerce-mode');
    if (isQuickCommerce) {
        shareText = "🛒 Shop authentic Telugu Podies and Parotas at Telugu Delicacies! Quick & easy ordering 😋";
    }

    // Check URL hash for section context
    const hash = window.location.hash;
    if (hash) {
        if (hash.includes('product') || hash.includes('categories')) {
            shareText = "🍽️ Explore our delicious product collections at Telugu Delicacies!";
        } else if (hash.includes('testimonial')) {
            shareText = "⭐ See what our customers say about Telugu Delicacies!";
        } else if (hash.includes('contact') || hash.includes('footer')) {
            shareText = "📞 Get in touch with Telugu Delicacies for your orders!";
        }
    }

    // Check visible section by scroll position
    const sections = [
        { id: 'product-categories', text: "🍽️ Check out our amazing product collections at Telugu Delicacies!" },
        { id: 'testimonials-section', text: "⭐ Loved by customers! See reviews at Telugu Delicacies" },
        { id: 'footer', text: "📞 Contact Telugu Delicacies for authentic homemade treats!" }
    ];

    const viewportCenter = window.innerHeight / 2;
    for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < viewportCenter && rect.bottom > viewportCenter) {
                shareText = section.text;
                break;
            }
        }
    }

    const fullMessage = `${shareText}\n${currentUrl}`;

    // Mobile: Use native share if available
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
        navigator.share({
            title: 'Telugu Delicacies',
            text: fullMessage
        }).catch(err => console.log('Share cancelled'));
        return;
    }

    // Fallback: Open WhatsApp with URL
    // Fix: Use correct URL scheme based on device
    if (isMobile) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`, '_blank');
    }
};

// QUICK PREVIEW POPUP FUNCTIONS
// Shows a quick preview popup when clicking on carousel products

// State for quick preview
window.quickPreviewState = {
    product: null,
    variants: [],
    selectedVariantIndex: 0,
    qty: 0,
    variantsOpen: false
};

window.showQuickPreview = function (product) {
    const overlay = document.getElementById('quickPreviewOverlay');
    const popup = document.getElementById('quickPreviewPopup');

    if (!overlay || !popup) return;

    // Store product in state
    window.quickPreviewState.product = product;
    window.quickPreviewState.qty = 0;
    window.quickPreviewState.selectedVariantIndex = 0;
    window.quickPreviewState.variantsOpen = false;

    // Sort variants: Matching Tag first, then Cheapest to Costliest
    const sortedVariants = window.getSortedVariants(product);
    window.quickPreviewState.variants = sortedVariants;

    // Populate UI elements  
    const imgEl = document.getElementById('quickPreviewImg');
    const subBrandEl = document.getElementById('quickPreviewSubBrand');
    const nameEl = document.getElementById('quickPreviewName');
    const teluguEl = document.getElementById('quickPreviewTelugu');
    const taglineEl = document.getElementById('quickPreviewTagline');
    const priceEl = document.getElementById('quickPreviewPrice');
    const mrpEl = document.getElementById('quickPreviewMrp');
    const discountEl = document.getElementById('quickPreviewDiscount');
    const variantSelector = document.getElementById('quickPreviewVariantSelector');
    const variantLabel = document.getElementById('quickPreviewVariantLabel');
    const variantsList = document.getElementById('quickPreviewVariantsList');
    const viewBtn = document.getElementById('quickPreviewViewBtn');

    // Image (optimized for popup display ~500px)
    const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
    const showcaseImg = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image;
    const rawImageUrl = showcaseImg || window.currentSiteSettings?.product_placeholder_url || '';
    const imageUrl = optimizeImage(rawImageUrl, { width: 500 });
    imgEl.src = imageUrl;
    imgEl.alt = product.product_name;

    // Sub-brand
    if (subBrandEl) {
        const subBrand = product.sub_brand || '';
        subBrandEl.textContent = subBrand;
        subBrandEl.style.display = subBrand ? 'block' : 'none';
    }

    // Product name
    nameEl.textContent = product.product_name;

    // Telugu name
    if (teluguEl) {
        const teluguName = product.product_name_telugu || '';
        teluguEl.textContent = teluguName;
        teluguEl.style.display = teluguName ? 'block' : 'none';
    }

    // Tagline
    const tagline = product.product_tagline || '';
    if (taglineEl) {
        taglineEl.textContent = tagline;
        taglineEl.style.display = tagline ? 'block' : 'none';
    }

    // Set first variant as selected
    const selectedVariant = sortedVariants[0];

    // Price display
    if (priceEl) priceEl.textContent = `₹${selectedVariant.price}`;

    // MRP and discount
    if (mrpEl && discountEl) {
        if (selectedVariant.mrp && Number(selectedVariant.mrp) > Number(selectedVariant.price)) {
            mrpEl.textContent = `₹${selectedVariant.mrp}`;
            mrpEl.style.display = 'inline';
            const discount = Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100);
            discountEl.textContent = `${discount}% OFF`;
            discountEl.style.display = 'inline';
        } else {
            mrpEl.style.display = 'none';
            discountEl.style.display = 'none';
        }
    }

    // Variant selector
    if (variantLabel) variantLabel.innerHTML = `<span class="variant-qty">${selectedVariant.quantity}</span>${selectedVariant.packaging_type ? `<span class="variant-pkg" style="display:inline; margin-left:4px;">(${selectedVariant.packaging_type})</span>` : ''}`;

    // Populate variants list
    if (variantsList) {
        variantsList.innerHTML = sortedVariants.map((v, idx) => `
            <div class="quick-preview-variant-option ${idx === 0 ? 'active' : ''}" onclick="window.selectQuickPreviewVariant(${idx})">
                <div class="variant-info">
                    <span class="variant-qty">${v.quantity}</span>
                    ${v.packaging_type ? `<span class="variant-pkg">${v.packaging_type}</span>` : ''}
                </div>
                <span class="variant-price">₹${v.price}</span>
            </div>
        `).join('');
        variantsList.style.display = 'none';
    }

    // Show/hide variant selector based on count
    if (variantSelector) {
        variantSelector.style.display = sortedVariants.length > 1 ? 'flex' : 'none';
    }

    // View Details button - link to sales page
    const productSlug = product.slug || product.id;
    const defaultVariant = sortedVariants[0];
    viewBtn.href = `/sales/${productSlug}${defaultVariant ? `?variant=${encodeURIComponent(defaultVariant.quantity)}` : ''}`;

    // Reset flip state on parent gallery
    const gallery = document.querySelector('.quick-preview-gallery');
    if (gallery) {
        gallery.classList.remove('flipped');
    }

    // Populate description for back panel
    const descEl = document.getElementById('quickPreviewDescription');
    if (descEl) {
        const description = product.product_description || product.product_tagline || 'No additional details available.';
        descEl.textContent = description;
    }

    // Reset cart UI
    window.updateQuickPreviewCartUI();

    // Pause carousel animation
    const productScroll = document.getElementById('productScroll');
    if (productScroll) {
        productScroll.style.animationPlayState = 'paused';
    }

    // Show popup
    overlay.classList.add('show');
    popup.classList.add('show');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
};

// Flip the quick preview gallery
window.flipQuickPreview = function () {
    const gallery = document.querySelector('.quick-preview-gallery');
    if (gallery) {
        gallery.classList.toggle('flipped');
    }
};

window.selectQuickPreviewVariant = function (index) {
    window.quickPreviewState.selectedVariantIndex = index;
    const variant = window.quickPreviewState.variants[index];

    // Update dropdown options visual state
    const options = document.querySelectorAll('.quick-preview-variant-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('active', idx === index);
    });

    // Update variant label in selector
    const variantLabel = document.getElementById('quickPreviewVariantLabel');
    if (variantLabel) variantLabel.innerHTML = `<span class="variant-qty">${variant.quantity}</span>${variant.packaging_type ? `<span class="variant-pkg" style="display:inline; margin-left:4px;">(${variant.packaging_type})</span>` : ''}`;

    // Update price display
    const priceEl = document.getElementById('quickPreviewPrice');
    const mrpEl = document.getElementById('quickPreviewMrp');
    const discountEl = document.getElementById('quickPreviewDiscount');

    if (priceEl) priceEl.textContent = `₹${variant.price}`;

    if (mrpEl && discountEl) {
        if (variant.mrp && Number(variant.mrp) > Number(variant.price)) {
            mrpEl.textContent = `₹${variant.mrp}`;
            mrpEl.style.display = 'inline';
            const discount = Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);
            discountEl.textContent = `${discount}% OFF`;
            discountEl.style.display = 'inline';
        } else {
            mrpEl.style.display = 'none';
            discountEl.style.display = 'none';
        }
    }

    // Close variants dropdown
    const variantsList = document.getElementById('quickPreviewVariantsList');
    if (variantsList) variantsList.style.display = 'none';
    window.quickPreviewState.variantsOpen = false;

    // Update View Details link with selected variant
    const viewBtn = document.getElementById('quickPreviewViewBtn');
    const product = window.quickPreviewState.product;
    if (viewBtn && product) {
        const productSlug = product.slug || product.id;
        viewBtn.href = `/sales/${productSlug}?variant=${encodeURIComponent(variant.quantity)}`;
    }

    // Check for Matching Image based on Packaging Type
    if (variant.packaging_type) {
        const normalized = variant.packaging_type.toLowerCase().trim();
        const productImages = window.allProductImagesCache || [];
        const matchingImg = productImages.find(img => {
            if (img.product_id !== product.id) return false;
            const tags = (img.tags || []).map(t => t.toLowerCase().trim());
            return tags.some(tag => tag.includes(normalized) || normalized.includes(tag));
        });

        if (matchingImg) {
            const imgEl = document.getElementById('quickPreviewImg');
            if (imgEl) {
                imgEl.src = optimizeImage(matchingImg.image_url, { width: 500 });
            }
        }
    }

    // Check if this variant is in cart
    window.updateQuickPreviewCartUI();
};

// Toggle variant dropdown visibility
window.toggleQuickPreviewVariants = function () {
    const variantsList = document.getElementById('quickPreviewVariantsList');
    if (!variantsList) return;

    window.quickPreviewState.variantsOpen = !window.quickPreviewState.variantsOpen;
    variantsList.style.display = window.quickPreviewState.variantsOpen ? 'block' : 'none';
};

window.updateQuickPreviewCartUI = function () {
    const addBtn = document.getElementById('quickPreviewAddBtn');
    const qtyCounter = document.getElementById('quickPreviewQtyCounter');
    const qtyVal = document.getElementById('quickPreviewQtyVal');

    const product = window.quickPreviewState.product;
    const variant = window.quickPreviewState.variants[window.quickPreviewState.selectedVariantIndex];

    if (!product || !variant) return;

    // Check if in cart (using localStorage cart from main page)
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    } catch (e) { }

    const cartItem = cart.find(item =>
        item.id == product.id &&
        (item.variant ? (item.variant.quantity === variant.quantity && (item.variant.packaging_type || '') === (variant.packaging_type || '')) : true)
    );

    const qty = cartItem ? cartItem.qty : 0;
    window.quickPreviewState.qty = qty;

    if (qty > 0) {
        addBtn.style.display = 'none';
        qtyCounter.style.display = 'inline-flex';
        qtyVal.textContent = qty;
    } else {
        addBtn.style.display = 'inline-flex';
        qtyCounter.style.display = 'none';
    }
};

window.quickPreviewAddToCart = function () {
    const product = window.quickPreviewState.product;
    const variant = window.quickPreviewState.variants[window.quickPreviewState.selectedVariantIndex];

    if (!product || !variant) return;

    // Get cart from localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    } catch (e) { }

    // Check if already exists
    const existingIdx = cart.findIndex(item =>
        item.id == product.id &&
        (item.variant ? (item.variant.quantity === variant.quantity && (item.variant.packaging_type || '') === (variant.packaging_type || '')) : true)
    );

    if (existingIdx > -1) {
        cart[existingIdx].qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.product_name,
            telugu_name: product.product_name_telugu || '',
            image: (window.allProductImagesCache || []).find(img => img.product_id === product.id && img.is_default)?.image_url || (window.allProductImagesCache || []).find(img => img.product_id === product.id)?.image_url || product.showcase_image,
            variant: variant,
            price: Number(variant.price) || 0,
            qty: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('td_cart', JSON.stringify(cart));

    // Update UI
    window.updateQuickPreviewCartUI();

    // Also update main cart count if function exists
    if (typeof window.updateMainCartUI === 'function') {
        window.updateMainCartUI();
    }
};

window.quickPreviewUpdateQty = function (delta) {
    const product = window.quickPreviewState.product;
    const variant = window.quickPreviewState.variants[window.quickPreviewState.selectedVariantIndex];

    if (!product || !variant) return;

    // Get cart from localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    } catch (e) { }

    const existingIdx = cart.findIndex(item =>
        item.id == product.id &&
        (item.variant ? (item.variant.quantity === variant.quantity && (item.variant.packaging_type || '') === (variant.packaging_type || '')) : true)
    );

    if (existingIdx > -1) {
        cart[existingIdx].qty += delta;

        if (cart[existingIdx].qty <= 0) {
            cart.splice(existingIdx, 1);
        }
    }

    // Save to localStorage
    localStorage.setItem('td_cart', JSON.stringify(cart));

    // Update UI
    window.updateQuickPreviewCartUI();

    // Also update main cart count if function exists
    if (typeof window.updateMainCartUI === 'function') {
        window.updateMainCartUI();
    }
};

window.closeQuickPreview = function () {
    const overlay = document.getElementById('quickPreviewOverlay');
    const popup = document.getElementById('quickPreviewPopup');

    if (overlay) overlay.classList.remove('show');
    if (popup) popup.classList.remove('show');

    // Resume carousel animation
    const productScroll = document.getElementById('productScroll');
    if (productScroll) {
        productScroll.style.animationPlayState = 'running';
    }

    // Re-enable body scroll
    document.body.style.overflow = '';

    // Clear state
    window.quickPreviewState = {
        product: null,
        variants: [],
        selectedVariantIndex: 0,
        qty: 0
    };
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeQuickPreview();
    }
});

/*
Features: Smooth scrolling, form handling, animations, enhanced product showcase with rem-based scaling
Fonts: Montserrat (headers), Roboto (body text), Noto Sans Telugu (Telugu content)
Scaling: Responsive rem-based system with fluid typography using clamp()
Last Updated: 2024 - Updated for comprehensive font and scaling strategy
*/

import { supabase } from './lib/supabase.js';

/*
========================================
SMOOTH SCROLLING NAVIGATION
Functions for smooth page navigation
========================================
*/

/**
 * Smoothly scrolls to a specific section on the page
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
    console.log('Scrolling to section:', sectionId);
    const section = document.getElementById(sectionId);
    console.log('Section found:', section);

    if (section) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;

        if (sectionId === 'footer-contact') {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            const targetPosition = section.offsetTop - headerHeight - 20;
            console.log('Scrolling to position:', targetPosition);

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Make scrollToSection globally accessible for inline onclick handlers
window.scrollToSection = scrollToSection;

// Helper: Generate URL-friendly slug
function generateSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ----------------------------------------------------
// CLIENT-SIDE ROUTING (Clean URLs)
// ----------------------------------------------------

// Handle internal links without reload
window.handleLinkClick = function (e, path) {
    // FIX: Force hard navigation for Sales Page links
    // This fixes the "View All" bug where SPA router tried (and failed) to load sales.html content
    if (path.includes('/sales/')) {
        return; // Allow default browser behavior (hard reload)
    }

    e.preventDefault();
    history.pushState({}, '', path);
    handleRouting();
};

// GLOBAL TOAST NOTIFICATION (Replaces alert)
window.showToast = function (message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    // Add icon based on type (optional)
    const icon = type === 'success' ? '<i class="fas fa-check-circle" style="color:#4ade80"></i> ' :
        type === 'error' ? '<i class="fas fa-exclamation-circle" style="color:#ef4444"></i> ' : '';

    toast.innerHTML = icon + message;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500); // 2.5 seconds
};

// Main Routing Logic
window.handleRouting = async function () {
    const path = window.location.pathname;

    // 1. Handle Sales/Category or Product URLs
    // Expected format: /sales/screen-slug (where screen-slug could be product or category)
    // Or just /slug if at root, but user asked for /sales/slug

    // We check if path matches /sales/something
    const match = path.match(/\/sales\/([^\/]+)/);

    if (match && match[1]) {
        const slug = match[1];
        console.log('Routing to slug:', slug);

        // Wait for data if not ready (simple check)
        if (!window.allProductsCache || window.allProductsCache.length === 0) {
            console.log('Data not loaded yet, routing will loop or wait...');
            // In a real app we'd queue this. For now, we assume this is called AFTER fetch.
            // If called directly on load, we rely on the init function calling this after fetch.
            return;
        }

        // A. Check if Product
        // Use allProductsCache
        const products = window.allProductsCache;
        const productMatch = products.find(p => (p.slug === slug) || (generateSlug(p.product_name) === slug));

        if (productMatch) {
            console.log('Found Product:', productMatch.product_name);
            // Open Modal
            if (window.openQuickProductModal) {
                window.openQuickProductModal(productMatch.id);
            }
            return;
        }

        // B. Check if Category
        // Categories are usually just strings in 'allProducts' map? No, fetchCategories() stores them in UI? 
        // Actually script.js uses `fetchCategories` for the filter bar. 
        // We might need to fetch categories or check the filter dropdown?
        // Let's rely on `window.allCategories` if it exists, OR check the `filterProducts` logic.
        // Using the filter function: `filterProducts(slug)`
        console.log('Assuming Category, filtering:', slug);
        if (window.filterProducts) {
            window.filterProducts(slug);
            // Also scroll to top or product section
            const prodSection = document.getElementById('product-categories');
            if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // Fallback for Query Params (Legacy Support + Direct Loads)
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        if (category && window.filterProducts) {
            window.filterProducts(category);
            const prodSection = document.getElementById('product-categories');
            if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Listen for PopState (Back/Forward button)
window.addEventListener('popstate', handleRouting);


/*
========================================
PRODUCT DESCRIPTION DISPLAY
Interactive dropdown functionality for product categories
========================================
*/

/**
 * Shows or hides product descriptions based on dropdown selection
 * @param {HTMLElement} selectElement - The dropdown select element
 * @param {string} category - The product category identifier
 */
function showProductDescription(selectElement, category) {
    // FIXED: Enhanced dropdown functionality for Telugu text support
    console.log('Dropdown selection changed:', selectElement.value);

    // Hide all descriptions for this category first
    const categoryCard = selectElement.closest('.category-card');
    const allDescriptions = categoryCard.querySelectorAll('.product-description');

    allDescriptions.forEach(desc => {
        desc.style.display = 'none';
        // Remove any existing animation classes
        desc.classList.remove('fade-in');
    });

    // Show selected description with animation
    const selectedValue = selectElement.value;
    if (selectedValue) {
        const descriptionElement = document.getElementById(`${category}-${selectedValue}`);
        if (descriptionElement) {
            descriptionElement.style.display = 'block';
            // Add fade-in animation class
            setTimeout(() => {
                descriptionElement.classList.add('fade-in');
            }, 10);

            // FIXED: Log for debugging Telugu functionality
            console.log('Showing description for:', selectedValue);
            console.log('Description element found:', descriptionElement);
        }
    }
}

/*
========================================
CONTACT FORM HANDLING
Form submission, validation, and user feedback
========================================
*/

/**
 * Handles contact form submission with validation and user feedback
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm(event.target)) {
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Get form data for Netlify
    const formData = new FormData(event.target);

    // Submit to Netlify
    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
        .then(() => {
            // Show success message
            showSuccessMessage('Thank you for your message! We will get back to you soon.');

            // Reset form
            event.target.reset();

            // Clear any validation errors
            clearFormErrors(event.target);
        })
        .catch((error) => {
            console.error('Form submission error:', error);
            showErrorMessage('Sorry, there was an error sending your message. Please try again or contact us directly.');
        })
        .finally(() => {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

/**
 * Validates the entire contact form
 * @param {HTMLFormElement} form - The form element to validate
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Shows a success message to the user
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    // Create a toast notification for better UX
    showToast(message, 'success');
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    // Create a toast notification for errors
    showToast(message, 'error');
}

/**
 * Creates and displays a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success' or 'error')
 */
function showToast(message, type = 'success') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add toast styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid;
            }
            
            .toast-success {
                border-left-color: #228B22;
                color: #228B22;
            }
            
            .toast-error {
                border-left-color: #dc3545;
                color: #dc3545;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .toast-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .toast-close:hover {
                background-color: rgba(0,0,0,0.1);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .toast-notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add toast to page
    document.body.appendChild(toast);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/*
========================================
HEADER SCROLL EFFECTS
Dynamic header styling based on scroll position
========================================
*/

/**
 * Updates header appearance based on scroll position
 */
function updateHeaderOnScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const scrollY = window.scrollY;

    if (scrollY > 20) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.9)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    }
}

/*
========================================
SCROLL ANIMATIONS
Intersection Observer for element animations on scroll
========================================
*/

/**
 * Helper: Sort variants based on default image tag and price (Ascending)
 * First: Variant matching Showcase Image Tag
 * Others: Smallest to Largest Price
 */
window.getSortedVariants = function (product) {
    let variants = [];
    try {
        if (typeof product.quantity_variants === 'string') {
            variants = JSON.parse(product.quantity_variants);
        } else if (Array.isArray(product.quantity_variants)) {
            variants = product.quantity_variants;
        }
    } catch (e) {
        console.warn('Variant parse error', e);
    }

    if (!variants || variants.length === 0) {
        return [{
            quantity: product.quantity || 'Standard',
            price: product.price,
            mrp: product.mrp,
            stock: product.total_stock,
            packaging_type: ''
        }];
    }

    // 1. Identify "Active Tag" from Showcase Image
    const productImages = window.allProductImagesCache || [];
    const showcaseImg = productImages.find(img => img.product_id === product.id && img.is_default) || productImages.find(img => img.product_id === product.id);
    const activeTags = (showcaseImg?.tags || []).map(t => t.toLowerCase().trim());

    // 2. Separate Matching Variant (First Match Wins)
    let matchingIdx = -1;
    if (activeTags.length > 0) {
        matchingIdx = variants.findIndex(v => {
            const pkg = (v.packaging_type || '').toLowerCase().trim();
            return pkg && activeTags.some(tag => tag.includes(pkg) || pkg.includes(tag));
        });
    }

    let firstVariant = null;
    let otherVariants = [...variants];

    if (matchingIdx > -1) {
        firstVariant = otherVariants.splice(matchingIdx, 1)[0];
    }

    // 3. Sort Others by Price (Ascending)
    otherVariants.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

    // 4. Combine
    return firstVariant ? [firstVariant, ...otherVariants] : otherVariants;
};

/**
 * Initializes scroll-triggered animations using Intersection Observer
 * Animates elements when they come into viewport
 */
function initializeScrollAnimations() {
    // Configuration for the intersection observer
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger 50px before element enters viewport
    };

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is in viewport - animate in
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.category-card, .info-card, .product-item');
    animateElements.forEach(el => {
        // Set initial state for animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        // Start observing the element
        observer.observe(el);
    });
}

/*
========================================
PRODUCT SHOWCASE CONTROLS
Interactive controls for the product ticker
========================================
*/

/**
 * Initializes hover and touch controls for the product showcase
 * Pauses animation on interaction for better user experience
 * Now works seamlessly with rem-based responsive scaling
 * FIXED: Reliable auto-scroll start using IntersectionObserver
 */
function initializeProductShowcaseControls() {
    const productScroll = document.getElementById('productScroll');
    const scrollContainer = productScroll?.parentElement;
    if (!productScroll) return;

    // Force animation restart to ensure it starts reliably
    forceAnimationRestart(productScroll);

    // Use IntersectionObserver to start animation when visible
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is visible - ensure animation is running
                forceAnimationRestart(productScroll);
            }
        });
    }, { threshold: 0.1 });

    visibilityObserver.observe(scrollContainer);

    // Initialize showcase mode management
    initializeShowcaseMode();

    // Initialize carousel controls (JS-based auto-scroll, arrows, dots)
    initializeCarouselControls();

    // Pause animation on mouse hover for better desktop UX
    productScroll.addEventListener('mouseenter', () => {
        productScroll.style.animationPlayState = 'paused';
    });

    // Resume animation when mouse leaves
    productScroll.addEventListener('mouseleave', () => {
        productScroll.style.animationPlayState = 'running';
    });

    // Touch interaction handling - only pause when user actively interacts horizontally
    let isUserInteracting = false;
    let interactionTimeout;

    const handleInteractionStart = () => {
        if (!isUserInteracting) {
            productScroll.style.animationPlayState = 'paused';
            isUserInteracting = true;
        }

        // Clear any existing timeout
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
    };

    const handleInteractionEnd = () => {
        // Resume ticker animation after brief delay
        interactionTimeout = setTimeout(() => {
            productScroll.style.animationPlayState = 'running';
            isUserInteracting = false;
        }, 2000); // Resume ticker after 2 seconds of inactivity
    };

    // Only pause ticker if user is actively scrolling (not just from ticker animation)
    let lastScrollLeft = scrollContainer.scrollLeft;
    let scrollCheckTimeout;

    scrollContainer.addEventListener('scroll', () => {
        const currentScrollLeft = scrollContainer.scrollLeft;

        // Only consider it user interaction if scroll position actually changed significantly
        if (Math.abs(currentScrollLeft - lastScrollLeft) > 5) {
            handleInteractionStart();

            // Clear previous timeout and set new one
            if (scrollCheckTimeout) {
                clearTimeout(scrollCheckTimeout);
            }

            scrollCheckTimeout = setTimeout(() => {
                handleInteractionEnd();
            }, 1000); // Resume ticker 1 second after scrolling stops
        }

        lastScrollLeft = currentScrollLeft;
    }, { passive: true });

    // Wheel events for desktop
    scrollContainer.addEventListener('wheel', (e) => {
        handleInteractionStart();

        // Allow smooth horizontal scrolling with wheel
        scrollContainer.scrollLeft += e.deltaY * 0.5;

        // Resume ticker after wheel interaction
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
        interactionTimeout = setTimeout(() => {
            productScroll.style.animationPlayState = 'running';
            isUserInteracting = false;
        }, 1500);

        e.preventDefault();
    });
}

/**
 * Forces animation restart by triggering a reflow
 * This ensures the animation starts reliably even if CSS wasn't ready
 */
function forceAnimationRestart(element) {
    const currentAnimation = getComputedStyle(element).animation;
    element.style.animation = 'none';
    // Trigger reflow
    void element.offsetHeight;
    element.style.animation = '';
    element.style.animationPlayState = 'running';
}

/*
========================================
SHOWCASE MODE MANAGEMENT
Intelligent automatic/manual mode switching
========================================
*/

/**
 * Initializes the intelligent showcase mode system
 * Handles automatic/manual mode transitions
 * FIXED: Direction-aware touch detection - allows vertical page scrolling
 */
function initializeShowcaseMode() {
    const productScroll = document.getElementById('productScroll');
    const scrollContainer = productScroll?.parentElement;
    if (!productScroll || !scrollContainer) return;

    let isManualMode = false;
    let autoReturnTimeout;
    let hoverTimeout;

    // Touch tracking for direction detection
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDecided = false; // Whether we've decided if this is horizontal or vertical scroll

    // Configuration
    const config = {
        autoReturnDelay: 3000,
        hoverActivationDelay: 500,
        transitionDuration: 300,
        swipeThreshold: 10 // Minimum pixels to determine swipe direction
    };

    /**
     * Switches to manual mode
     */
    function activateManualMode() {
        if (isManualMode) return;

        isManualMode = true;
        productScroll.style.animationPlayState = 'paused';
        scrollContainer.style.cursor = 'grab';

        // Clear any existing timeout
        if (autoReturnTimeout) {
            clearTimeout(autoReturnTimeout);
        }
    }

    /**
     * Returns to automatic mode
     */
    function activateAutoMode() {
        if (!isManualMode) return;

        isManualMode = false;
        productScroll.style.animationPlayState = 'running';
        scrollContainer.style.cursor = '';
    }

    /**
     * Sets up auto-return timer
     */
    function setupAutoReturn() {
        if (autoReturnTimeout) {
            clearTimeout(autoReturnTimeout);
        }

        autoReturnTimeout = setTimeout(() => {
            activateAutoMode();
        }, config.autoReturnDelay);
    }

    // Hover intent detection (desktop)
    scrollContainer.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            activateManualMode();
        }, config.hoverActivationDelay);
    });

    scrollContainer.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        setupAutoReturn();
    });

    // Direction-aware touch detection (mobile)
    // Only activate manual mode for horizontal swipes, allowing vertical page scroll
    scrollContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchDecided = false;
        }
    }, { passive: true });

    scrollContainer.addEventListener('touchmove', (e) => {
        if (touchDecided || e.touches.length !== 1) return;

        const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

        // Only decide direction once we've moved enough
        if (deltaX > config.swipeThreshold || deltaY > config.swipeThreshold) {
            touchDecided = true;

            // If horizontal movement is greater, this is a carousel swipe
            if (deltaX > deltaY) {
                activateManualMode();
            }
            // If vertical, do nothing - let page scroll naturally
        }
    }, { passive: true });

    scrollContainer.addEventListener('touchend', () => {
        if (isManualMode) {
            setupAutoReturn();
        }
        touchDecided = false;
    }, { passive: true });

    scrollContainer.addEventListener('touchcancel', () => {
        if (isManualMode) {
            setupAutoReturn();
        }
        touchDecided = false;
    }, { passive: true });

    // Scroll wheel intent detection - REMOVED per user request ("stop responding to vertical scroll")
    /* scrollContainer.addEventListener('wheel', (e) => {
        activateManualMode();
        scrollContainer.scrollLeft += e.deltaY * 0.5;
        
        // Prevent default only if we're actually scrolling horizontally 
        // to allow vertical page scrolling
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if ((scrollContainer.scrollLeft > 0 && e.deltaY < 0) || 
            (scrollContainer.scrollLeft < maxScroll && e.deltaY > 0)) {
            // e.preventDefault(); // Don't block vertical scroll of page, just don't hijack it
        }
    }, { passive: true }); */

    // Focus intent detection (accessibility)
    scrollContainer.addEventListener('focus', () => {
        activateManualMode();
    });

    scrollContainer.addEventListener('blur', () => {
        setupAutoReturn();
    });

    // Manual scrolling detection
    let lastScrollLeft = scrollContainer.scrollLeft;
    scrollContainer.addEventListener('scroll', () => {
        const currentScrollLeft = scrollContainer.scrollLeft;

        if (Math.abs(currentScrollLeft - lastScrollLeft) > 5) {
            activateManualMode();
            setupAutoReturn();
        }

        lastScrollLeft = currentScrollLeft;
    }, { passive: true });
}

/*
========================================
CAROUSEL CONTROLS - JS-BASED SCROLLING
Auto-scroll with navigation arrows and progress dots
========================================
*/

// Global carousel state
const carouselState = {
    scrollInterval: null,
    isPaused: false,
    scrollSpeed: 1,
    autoResumeTimeout: null
};

/**
 * Initializes carousel navigation arrows (prev/next buttons)
 */
function initializeCarouselArrows() {
    const scrollContainer = document.querySelector('.product-scroll-wrapper');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    // Calculate scroll amount (80% of visible width)
    const getScrollAmount = () => {
        return scrollContainer.clientWidth * 0.8;
    };

    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
        });
    });

    // Update arrow visibility based on scroll position
    const updateArrowState = () => {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft >=
            scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;

        prevBtn.classList.toggle('disabled', isAtStart);
        nextBtn.classList.toggle('disabled', isAtEnd);
    };

    scrollContainer.addEventListener('scroll', updateArrowState, { passive: true });
    updateArrowState(); // Initial state
}

/**
 * Initializes progress indicator dots
 */
function initializeCarouselProgress() {
    const scrollContainer = document.querySelector('.product-scroll-wrapper');
    const progressContainer = document.getElementById('carouselProgress');

    if (!scrollContainer || !progressContainer) return;

    // Wait for products to load, then create dots
    const createDots = () => {
        // Find direct children of product-scroll (the actual cards)
        const productScroll = scrollContainer.querySelector('.product-scroll, #productScroll');
        if (!productScroll) return;
        const cards = productScroll.children;
        if (cards.length === 0) return;

        // Calculate visible cards and pages
        const containerWidth = scrollContainer.clientWidth;
        const cardWidth = cards[0]?.offsetWidth || 200;
        const gap = 20;
        const cardsPerPage = Math.floor(containerWidth / (cardWidth + gap)) || 1;
        const totalPages = Math.ceil(cards.length / cardsPerPage);

        // Create dots (max 10 to avoid clutter)
        const dotCount = Math.min(totalPages, 10);
        progressContainer.innerHTML = '';

        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'progress-dot';
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            dot.dataset.page = i;

            dot.addEventListener('click', () => {
                const scrollTo = (scrollContainer.scrollWidth - containerWidth) * (i / (dotCount - 1));
                scrollContainer.scrollTo({
                    left: scrollTo,
                    behavior: 'smooth'
                });
            });

            progressContainer.appendChild(dot);
        }

        updateActiveDot();
    };

    // Update active dot based on scroll position
    const updateActiveDot = () => {
        const dots = progressContainer.querySelectorAll('.progress-dot');
        if (dots.length === 0) return;

        const scrollPercent = scrollContainer.scrollLeft /
            Math.max(1, scrollContainer.scrollWidth - scrollContainer.clientWidth);
        const activeIndex = Math.round(scrollPercent * (dots.length - 1));

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex);
        });
    };

    scrollContainer.addEventListener('scroll', updateActiveDot, { passive: true });

    // Create dots when products are loaded
    setTimeout(createDots, 500); // Delay to ensure products are rendered

    // Re-create dots on window resize
    window.addEventListener('resize', debounce(createDots, 250));
}

/**
 * Initializes drag-to-scroll functionality for desktop
 */
function initializeCarouselDrag() {
    const scrollContainer = document.querySelector('.product-scroll-wrapper');
    const productScroll = document.getElementById('productScroll');

    if (!scrollContainer) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    // Mouse down - start drag
    scrollContainer.addEventListener('mousedown', (e) => {
        // Ignore if clicking on a link or button
        if (e.target.closest('a, button')) return;

        isDragging = true;
        scrollContainer.classList.add('is-dragging');
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;

        // Pause animation
        if (productScroll) {
            productScroll.style.animationPlayState = 'paused';
        }
    });

    // Mouse move - drag scroll
    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5; // Multiplier for drag speed
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Mouse up - end drag
    const endDrag = () => {
        if (!isDragging) return;

        isDragging = false;
        scrollContainer.classList.remove('is-dragging');

        // Resume animation after delay
        setTimeout(() => {
            if (productScroll && !scrollContainer.matches(':hover')) {
                productScroll.style.animationPlayState = 'running';
            }
        }, 2000);
    };

    scrollContainer.addEventListener('mouseup', endDrag);
    scrollContainer.addEventListener('mouseleave', endDrag);
}

/**
 * Master function to initialize all carousel controls
 */
/**
 * Generic Carousel Setup Function
 * Replaces hardcoded logic to allow multiple carousels (Products, Testimonials)
 */
function setupCarousel({ wrapperId, contentId, prevId, nextId, progressId, speed = 1 }) {
    const scrollWrapper = document.getElementById(wrapperId);
    const scrollContent = document.getElementById(contentId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const progressContainer = document.getElementById(progressId);

    if (!scrollWrapper || !scrollContent) return;

    // State specific to this carousel instance
    const state = {
        scrollInterval: null,
        isPaused: false,
        autoResumeTimeout: null,
        scrollSpeed: speed
    };

    // Wait for content load
    setTimeout(() => {
        // Ensure CSS animations are RUNNING for auto-scroll
        // The CSS 'animation' property in styles.css handles the scrolling
        scrollWrapper.style.animationPlayState = 'running';
        if (scrollContent) scrollContent.style.animationPlayState = 'running';

        const scheduleResume = () => {
            clearTimeout(state.autoResumeTimeout);
            state.autoResumeTimeout = setTimeout(() => {
                state.isPaused = false;
                // Resume CSS Animation
                scrollWrapper.style.animationPlayState = 'running';
                if (scrollContent) scrollContent.style.animationPlayState = 'running';
            }, 2500);
        };
        // 4. Pause on hover/touch (CSS Animation Control)
        const pauseAnimation = () => {
            state.isPaused = true;
            scrollWrapper.style.animationPlayState = 'paused';
            if (scrollContent) scrollContent.style.animationPlayState = 'paused';
        };

        scrollWrapper.addEventListener('mouseenter', pauseAnimation);
        scrollWrapper.addEventListener('mouseleave', scheduleResume);
        scrollWrapper.addEventListener('touchstart', pauseAnimation, { passive: true });
        scrollWrapper.addEventListener('touchend', scheduleResume, { passive: true });

    }, 1000);
}

/**
 * Setup Product Carousel specifically
 */
function initializeProductCarousel() {
    setupCarousel({
        wrapperId: 'productScrollWrapper',
        contentId: 'productScroll',
        prevId: 'carouselPrev',
        nextId: 'carouselNext',
        progressId: 'carouselProgress',
        speed: 1
    });
}

/**
 * Setup Testimonial Carousel specifically
 */
function initializeTestimonialCarousel() {
    setupCarousel({
        wrapperId: 'testimonialScrollWrapper',
        contentId: 'testimonialsScroll',
        prevId: 'testimonialPrev',
        nextId: 'testimonialNext',
        progressId: null,
        speed: 1
    });
}

/**
 * Master function to initialize all carousel controls
 */
function initializeCarouselControls() {
    initializeProductCarousel();
    // Testimonials will be initialized after fetch
}

/*
========================================
FORM VALIDATION SYSTEM
Real-time form validation with user feedback
========================================
*/

/**
 * Validates an individual form field
 * @param {Event} event - The field blur or input event
 * @returns {boolean} - True if field is valid, false otherwise
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    // Remove existing error styling
    field.classList.remove('error');
    clearFieldError(field);

    // Validation rules
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }

    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }

    return true;
}

/**
 * Clears field error state and message
 * @param {HTMLElement} field - The form field element
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Displays error message for a form field
 * @param {HTMLElement} field - The form field element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    clearFieldError(field);

    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert'); // Accessibility

    field.parentNode.appendChild(errorElement);
}

/**
 * Clears all form errors
 * @param {HTMLFormElement} form - The form element
 */
function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    const errorFields = form.querySelectorAll('.error');

    errorElements.forEach(el => el.remove());
    errorFields.forEach(field => field.classList.remove('error'));
}

/**
 * Validates email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if phone is valid, false otherwise
 */
function isValidPhone(phone) {
    // Allow international format, digits, spaces, hyphens, and parentheses
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/*
========================================
PERFORMANCE OPTIMIZATION
Debouncing scroll events for better performance
========================================
*/

/**
 * Debounces a function to prevent excessive calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/*
========================================
IMAGE LOADING OPTIMIZATION
Lazy loading and error handling for images
========================================
*/

/**
 * Initializes image loading optimizations
 * Handles loading states and errors gracefully
 */
function initializeImageOptimizations() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Set initial opacity for loading animation
        if (!img.complete) {
            img.style.opacity = '0';
        }

        // Handle successful image load
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });

        // Handle image load errors
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
            // You could set a fallback image here
            // img.src = '/images/fallback.jpg';
        });
    });
}

/*
========================================
ACCESSIBILITY ENHANCEMENTS
Keyboard navigation and screen reader support
========================================
*/

/**
 * Enhances form accessibility
 * Adds proper ARIA labels and keyboard navigation
 */
function enhanceAccessibility() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Add field validation event listeners
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);

        // Enhance keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.type !== 'textarea') {
                e.preventDefault();
                const nextField = getNextFormField(input);
                if (nextField) {
                    nextField.focus();
                } else {
                    // Last field - focus submit button
                    const submitBtn = form.querySelector('.submit-btn');
                    if (submitBtn) submitBtn.focus();
                }
            }
        });
    });
}

/*
========================================
VELOCITY-BASED CAROUSEL LOGIC
JavaScript-driven animation using requestAnimationFrame
========================================
*/

/**
 * Initialize JS-driven infinite carousel animation
 * @param {HTMLElement} container - The scrolling container
 * @param {number} pixelsPerSecond - Speed in pixels per second (default: 50)
 */
function initVelocityCarousel(container, pixelsPerSecond = 50) {
    if (!container || container.children.length === 0) return;

    // HELPER: The actual logic moves here so we can delay it
    const setup = () => {
        console.log('🔄 Setting up JS-driven carousel...', container);

        // 1. Clear any previous CSS animation
        container.style.animation = 'none';
        container.style.transform = 'translate3d(0, 0, 0)';

        const originalItems = Array.from(container.children);
        console.log('📦 Original items count:', originalItems.length);

        // SAFETY: If styles haven't loaded, width might be 0. Stop to prevent crash.
        if (originalItems[0] && originalItems[0].offsetWidth === 0) {
            console.warn('⚠️ Carousel items have 0 width. Waiting...');
            requestAnimationFrame(setup);
            return;
        }

        console.log('📏 First item width:', originalItems[0]?.offsetWidth);

        const requiredWidth = window.innerWidth * 2;

        // Clone items to fill screen width
        let safety = 0;
        while (container.scrollWidth < requiredWidth && safety < 100) {
            originalItems.forEach(item => container.appendChild(item.cloneNode(true)));
            safety++;
        }
        console.log('🔁 Cloned', safety, 'times to fill width');

        // Duplicate EVERYTHING once more for the A+A seamless loop pattern
        const currentChildren = Array.from(container.children);
        currentChildren.forEach(item => container.appendChild(item.cloneNode(true)));
        console.log('✅ Total items after A+A pattern:', container.children.length);

        // Lock width to exact pixels
        const finalWidth = container.scrollWidth;
        container.style.width = finalWidth + 'px';
        console.log('🔒 Locked width to:', finalWidth + 'px');

        // Calculate the half-width (reset point)
        const halfWidth = finalWidth / 2;
        console.log('📐 Half width (reset point):', halfWidth + 'px');

        // 🎮 ANIMATION STATE
        let currentPos = 0;
        let isPaused = false;
        const pixelsPerFrame = pixelsPerSecond / 60; // 60fps target

        console.log('⚡ Pixels per frame:', pixelsPerFrame.toFixed(2));

        // 🎬 THE ANIMATION LOOP
        function animate() {
            if (!isPaused) {
                // Move left
                currentPos -= pixelsPerFrame;

                // Reset when we've moved half the width (seamless loop)
                if (currentPos <= -halfWidth) {
                    currentPos += halfWidth;
                }

                // Apply transform (GPU accelerated)
                container.style.transform = `translate3d(${currentPos}px, 0, 0)`;
            }

            // Continue the loop
            requestAnimationFrame(animate);
        }

        // 🖱️ HOVER PAUSE (Desktop only)
        container.addEventListener('mouseenter', () => {
            isPaused = true;
            console.log('⏸️ Carousel paused');
        });

        container.addEventListener('mouseleave', () => {
            isPaused = false;
            console.log('▶️ Carousel resumed');
        });

        // 🚀 START THE ANIMATION
        requestAnimationFrame(animate);
        console.log('🎬 JS Animation loop started! Speed:', pixelsPerSecond, 'px/s');
    };

    // EXECUTION STRATEGY: Wait for images to load
    if (document.readyState === 'complete') {
        setup();
    } else {
        window.addEventListener('load', setup);
    }
}

/*
========================================
WHATSAPP INTEGRATION
========================================
*/
function getNextFormField(currentField) {
    const form = currentField.closest('form');
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const currentIndex = fields.indexOf(currentField);
    return fields[currentIndex + 1] || null;
}

/*
========================================
MOBILE MENU FUNCTIONALITY
Enhanced mobile navigation (for future use)
========================================
*/

/**
 * Initializes mobile menu functionality
 * Currently handles navigation button interactions
 */
function initializeMobileInteractions() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        // Add touch feedback
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
        });

        btn.addEventListener('touchend', () => {
            btn.style.transform = '';
        });

        // Handle click events
        btn.addEventListener('click', () => {
            // Add ripple effect or other feedback if desired
            addClickFeedback(btn);
        });
    });
}

/**
 * Adds visual feedback for button clicks
 * @param {HTMLElement} button - The button element
 */
function addClickFeedback(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

/**
 * Enables smooth horizontal scrolling with momentum
 * @param {HTMLElement} container - The scroll container
 */
function enableSmoothScrolling(container) {
    let isScrolling = false;
    let scrollVelocity = 0;
    let lastScrollLeft = container.scrollLeft;
    let lastTime = Date.now();

    function updateMomentum() {
        if (isScrolling) {
            const now = Date.now();
            const deltaTime = now - lastTime;
            const deltaScroll = container.scrollLeft - lastScrollLeft;

            scrollVelocity = deltaScroll / deltaTime;
            lastScrollLeft = container.scrollLeft;
            lastTime = now;

            requestAnimationFrame(updateMomentum);
        } else if (Math.abs(scrollVelocity) > 0.1) {
            // Apply momentum scrolling
            container.scrollLeft += scrollVelocity * 16; // 16ms frame time
            scrollVelocity *= 0.95; // Friction
            requestAnimationFrame(updateMomentum);
        }
    }

    container.addEventListener('touchstart', () => {
        isScrolling = true;
        scrollVelocity = 0;
        lastScrollLeft = container.scrollLeft;
        lastTime = Date.now();
        updateMomentum();
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isScrolling = false;
    }, { passive: true });
}

/*
========================================
MAIN INITIALIZATION
Sets up all functionality when the page loads
========================================
*/

/*
========================================
HEADER NAVIGATION FUNCTIONALITY
Complete header navigation with WhatsApp integration
========================================
*/

// WhatsApp catalog configuration - Already defined globally
// const WHATSAPP_CATALOG_URL = "https://wa.me/c/919618519191";

/**
 * Check if user is on mobile device
 * @returns {boolean} True if mobile device detected
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

/**
 * Handle WhatsApp button click
 * Mobile: Direct to catalog, Desktop: Use Standardized Web Interface
 */
function handleWhatsAppClick() {
    window.openWhatsAppCatalog();
}

/**
 * Show WhatsApp QR code modal for desktop users
 */
function showWhatsAppQR() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('whatsappQRModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'whatsappQRModal';
        modal.className = 'whatsapp-qr-modal';
        modal.innerHTML = `
            <div class="whatsapp-qr-backdrop"></div>
            <div class="whatsapp-qr-content">
                <button class="whatsapp-qr-close" onclick="closeWhatsAppQR()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="whatsapp-qr-header">
                    <i class="fab fa-whatsapp"></i>
                    <h3>Scan to Open Catalog</h3>
                    <p>Scan this QR code with your phone to view our products on WhatsApp</p>
                </div>
                <div class="whatsapp-qr-code">
                    <canvas id="qrCanvas"></canvas>
                </div>
                <div class="whatsapp-qr-footer">
                    <p>Or visit: <a href="${WHATSAPP_CATALOG_URL}" target="_blank">${WHATSAPP_CATALOG_URL}</a></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles
        if (!document.getElementById('whatsapp-qr-styles')) {
            const styles = document.createElement('style');
            styles.id = 'whatsapp-qr-styles';
            styles.textContent = `
                .whatsapp-qr-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    visibility: visible;
                    transition: all 0.3s ease;
                }
                .whatsapp-qr-modal.hidden {
                    opacity: 0;
                    visibility: hidden;
                }
                .whatsapp-qr-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }
                .whatsapp-qr-content {
                    position: relative;
                    background: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90vw;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .whatsapp-qr-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    transition: color 0.2s ease;
                }
                .whatsapp-qr-close:hover {
                    color: #333;
                }
                .whatsapp-qr-header i {
                    font-size: 3rem;
                    color: #25D366;
                    margin-bottom: 1rem;
                }
                .whatsapp-qr-header h3 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                }
                .whatsapp-qr-header p {
                    margin: 0 0 2rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }
                .whatsapp-qr-code {
                    margin: 2rem 0;
                }
                .whatsapp-qr-code canvas {
                    max-width: 200px;
                    height: auto;
                }
                .whatsapp-qr-footer p {
                    font-size: 0.8rem;
                    color: #666;
                    margin: 0;
                }
                .whatsapp-qr-footer a {
                    color: #0077B6;
                    text-decoration: none;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Generate QR code if library is available
    if (typeof QRCode !== 'undefined') {
        const canvas = document.getElementById('qrCanvas');
        if (canvas) {
            QRCode.toCanvas(canvas, WHATSAPP_CATALOG_URL, { width: 200 }, function (error) {
                if (error) console.error('QR Code generation error:', error);
            });
        }
    } else {
        // Fallback if QR library not available
        document.querySelector('.whatsapp-qr-code').innerHTML = `
            <p style="color: #666; font-size: 0.9rem;">QR Code library not loaded.<br>
            <a href="${WHATSAPP_CATALOG_URL}" target="_blank" style="color: #25D366;">Click here to open catalog</a></p>
        `;
    }
}

/*
========================================
Close WhatsApp QR Modal
========================================
*/
function closeWhatsAppQR() {
    const modal = document.getElementById('whatsappQRModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    if (!mobileNav || !hamburgerBtn) return;

    const isOpen = mobileNav.classList.contains('show');

    if (isOpen) {
        mobileNav.classList.remove('show');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        mobileNav.classList.add('show');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close mobile navigation menu
 */
function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    if (!mobileNav || !hamburgerBtn) return;

    mobileNav.classList.remove('show');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Handle navigation button clicks
 * @param {string} target - Target section to scroll to
 */
function handleNavigation(target) {
    scrollToSection(target);
    closeMobileMenu();
}

/**
 * Initialize header navigation functionality
 * Sets up all event listeners for navigation buttons
 */
function initializeHeaderNavigation() {
    // Query all button elements
    const productsBtn = document.getElementById('productsBtn');
    const contactBtn = document.getElementById('contactBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    // Desktop navigation buttons
    if (productsBtn) {
        productsBtn.addEventListener('click', () => handleNavigation('product-categories'));
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            console.log('Desktop contact button clicked');
            handleNavigation('footer-contact');
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppClick);
    }

    // Hamburger menu button
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    // Mobile navigation buttons
    const mobileProductsBtn = document.getElementById('mobileProductsBtn');
    const mobileContactBtn = document.getElementById('mobileContactBtn');
    const mobileWhatsappBtn = document.getElementById('mobileWhatsappBtn');

    if (mobileProductsBtn) {
        mobileProductsBtn.addEventListener('click', () => handleNavigation('product-categories'));
    }

    if (mobileContactBtn) {
        mobileContactBtn.addEventListener('click', () => {
            console.log('Mobile contact button clicked');
            handleNavigation('footer-contact');
        });
    }

    if (mobileWhatsappBtn) {
        mobileWhatsappBtn.addEventListener('click', handleWhatsAppClick);
    }

    // Click outside to close mobile menu
    document.addEventListener('click', (e) => {
        const mobileNav = document.getElementById('mobileNav');
        const hamburgerBtn = document.getElementById('hamburgerBtn');

        if (!mobileNav || !hamburgerBtn) return;

        const isMenuOpen = mobileNav.classList.contains('show');
        const isClickOnMenu = mobileNav.contains(e.target);
        const isClickOnHamburger = hamburgerBtn.contains(e.target);

        if (isMenuOpen && !isClickOnMenu && !isClickOnHamburger) {
            closeMobileMenu();
        }
    });

    // Click outside to close WhatsApp QR modal
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('whatsappQRModal');
        if (modal && e.target.classList.contains('whatsapp-qr-backdrop')) {
            closeWhatsAppQR();
        }
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeWhatsAppQR();

            // Close any open product overlays
            const openCard = document.querySelector('.master-card.show-product');
            if (openCard) {
                const category = openCard.dataset.category;
                const selectId = `select-${category}`;
                // Usage of existing closeOverlay function if available
                if (typeof window.closeOverlay === 'function') {
                    window.closeOverlay(category, selectId);
                }
            }
        }
    });
}

/*
========================================
MAIN INITIALIZATION FUNCTION
========================================
*/

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize header navigation
    initializeHeaderNavigation();

    // Initialize other functionality
    // Initialize other functionality
    initializeScrollAnimations();
    updateScrollSpeeds(); // Apply dynamic speeds
    initializeProductShowcaseControls();
    initializeMobileInteractions();
    enhanceAccessibility();
    initializeImageOptimizations();

    // Fetch site settings and section visibility IN PARALLEL for speed
    await Promise.all([
        fetchSiteSettings(),
        fetchWebsiteSections()
    ]);

    // Fetch and render products & testimonials (these already run in parallel)
    fetchAndRenderProducts();
    fetchAndRenderTestimonials();

    // Setup form validation if contact form exists
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    console.log('All functionality initialized successfully');

    // Fallback: Remove preloader after 3 seconds if it hasn't been removed yet
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('fade-out')) {
            console.warn('Preloader removed by fallback timeout');
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 500);
        }
    }, 3000);
});

// Handle page visibility changes (for performance optimization)
document.addEventListener('visibilitychange', () => {
    const productScroll = document.getElementById('productScroll');

    if (productScroll) {
        if (document.hidden) {
            // Page is hidden - pause animations to save resources
            productScroll.style.animationPlayState = 'paused';
        } else {
            // Page is visible - resume ticker animation
            productScroll.style.animationPlayState = 'running';
        }
    }
});

// Add scroll header effects
let lastScrollY = window.scrollY;
// Removed scroll effects to keep header persistent as requested

// Handle connection changes (for progressive enhancement)
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
        // Could adjust image quality or disable heavy animations on slow connections
        console.log('Connection changed:', navigator.connection.effectiveType);
    });
}

// Make functions globally available
window.closeWhatsAppQR = closeWhatsAppQR;
window.closeMobileMenu = closeMobileMenu;

// Global settings cache
window.currentSiteSettings = {};

/**
 * Fetches site settings and applies them
 */
async function fetchSiteSettings() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (error) {
            console.warn('Could not fetch site settings:', error);
            return null;
        }

        if (data) {
            window.currentSiteSettings = data; // Cache globally
            preloadCatalogue(); // Pre-load catalogue after settings are ready

            // Title
            if (data.site_title) document.title = data.site_title;

            // Logo
            if (data.logo_url) {
                const logoImgs = document.querySelectorAll('.logo');
                logoImgs.forEach(img => img.src = data.logo_url);
            }

            // Header Titles
            if (data.site_title) {
                const el = document.getElementById('header-site-title');
                if (el) el.innerText = data.site_title;
                document.title = data.site_title;
            }
            if (data.site_title_telugu) {
                // Main page Telugu brand
                const el = document.getElementById('header-site-title-telugu');
                if (el) el.innerText = data.site_title_telugu;
                // Sales page Telugu brand
                const el2 = document.getElementById('header-telugu-brand');
                if (el2) el2.innerText = data.site_title_telugu;
            }

            // Favicon
            if (data.fav_icon_url) {
                const link = document.querySelector("link[rel~='icon']");
                if (link) link.href = data.fav_icon_url;
            }

            // Hero
            if (data.hero_title) document.getElementById('hero-title').innerText = data.hero_title;
            if (data.hero_subtitle) document.getElementById('hero-subtitle').innerText = data.hero_subtitle;
            if (data.hero_telugu_subtitle) document.getElementById('hero-telugu-subtitle').innerText = data.hero_telugu_subtitle;

            // Hero Description (Replace paragraph content or container)
            if (data.hero_description) {
                const descContainer = document.getElementById('hero-description-container');
                if (descContainer) {
                    // Update the paragraph inside
                    descContainer.innerHTML = `<p class="hero-subtitle">${data.hero_description}</p>`;
                }
            }

            if (data.hero_background_url) {
                const heroSection = document.querySelector('.hero');
                if (heroSection) heroSection.style.backgroundImage = `url('${data.hero_background_url}')`;
            }

            // Quick Layout from site_settings (kept for backward compatibility with hero styling)
            // The actual section visibility is handled by fetchWebsiteSections()

            // QUICK COMMERCE HERO STYLING
            // This only handles the hero visual changes, not section visibility
            if (data.show_quick_layout) {
                const heroSection = document.querySelector('.hero');
                const descContainer = document.getElementById('hero-description-container');

                if (heroSection) {
                    heroSection.classList.add('hero-quick-commerce');
                    const bgUrl = data.quick_hero_image_url || './images/quick_commerce_hero.png';
                    heroSection.style.backgroundImage = `url('${bgUrl}')`;
                }

                document.body.classList.add('quick-commerce-mode');

                const titleEl = document.getElementById('hero-title');
                const teluguSubtitleEl = document.getElementById('hero-telugu-subtitle');
                const subtitleEl = document.getElementById('hero-subtitle');

                if (titleEl) titleEl.innerText = data.quick_hero_title || "Groceries in Minutes";
                if (teluguSubtitleEl) teluguSubtitleEl.innerText = data.quick_hero_telugu_subtitle || "అవసరమైన సరుకులు, నిమిషాల్లో మీ ఇంటికి";
                if (subtitleEl) subtitleEl.innerText = data.quick_hero_subtitle || "Freshness delivered at the speed of life.";

                if (descContainer) descContainer.style.display = 'none';
            } else {
                const heroSection = document.querySelector('.hero');
                const descContainer = document.getElementById('hero-description-container');

                if (heroSection) heroSection.classList.remove('hero-quick-commerce');
                document.body.classList.remove('quick-commerce-mode');
                if (descContainer) descContainer.style.display = 'block';
            }

            // Contact Info
            if (data.contact_phone_primary) {
                const el = document.getElementById('contact-phone-primary');
                if (el) { el.innerText = data.contact_phone_primary; el.href = `tel:${data.contact_phone_primary.replace(/\s/g, '')}`; }
            }
            if (data.contact_phone_secondary) {
                const el = document.getElementById('contact-phone-secondary');
                if (el) { el.innerText = data.contact_phone_secondary; el.href = `tel:${data.contact_phone_secondary.replace(/\s/g, '')}`; }
            }
            if (data.contact_email) {
                const el = document.getElementById('contact-email');
                if (el) { el.innerText = data.contact_email; el.href = `mailto:${data.contact_email}`; }
            }
            if (data.fssai_number) {
                const el = document.getElementById('contact-fssai');
                if (el) el.innerText = `FSSAI License No: ${data.fssai_number}`;
            }
            if (data.company_address) {
                const el = document.getElementById('contact-address');
                if (el) {
                    el.innerHTML = `<p>${data.company_address}</p>`;
                }
            } else if (data.address_line1 || data.address_line2) {
                const el = document.getElementById('contact-address');
                if (el) {
                    el.innerHTML = `
                        <p>${data.address_line1 || ''}</p>
                        <p>${data.address_line2 || ''}</p>
                    `;
                }
            }

            // Map
            if (data.map_embed_url) {
                const mapContainer = document.getElementById('footer-map-container');
                if (mapContainer) {
                    let mapSrc = data.map_embed_url;
                    // Extract src if user pasted full iframe tag
                    if (mapSrc.includes('<iframe')) {
                        const match = mapSrc.match(/src=["']([^"']+)["']/);
                        if (match && match[1]) {
                            mapSrc = match[1];
                        }
                    }
                    mapContainer.innerHTML = `<iframe src="${mapSrc}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
                }
            }

            // Google Review URL (Write a Review button)
            if (data.google_review_url) {
                const writeReviewBtn = document.getElementById('writeReviewBtn');
                if (writeReviewBtn) writeReviewBtn.href = data.google_review_url;
            }

            // Social Media Links
            const socialMap = [
                { id: 'footer-facebook-link', url: data.facebook_url },
                { id: 'footer-instagram-link', url: data.instagram_url },
                { id: 'footer-whatsapp-link', url: data.whatsapp_url },
                { id: 'footer-youtube-link', url: data.youtube_url }
            ];

            socialMap.forEach(item => {
                const el = document.getElementById(item.id);
                if (el) {
                    let url = item.url;
                    // Auto-format WhatsApp number if user entered just digits
                    if (url && item.id === 'footer-whatsapp-link' && /^\d+$/.test(url.replace(/[\s\+]/g, ''))) {
                        url = `https://wa.me/${url.replace(/[\s\+]/g, '')}`;
                    }

                    if (url) {
                        el.href = url;
                        el.style.display = 'flex';
                    } else {
                        el.style.display = 'none';
                    }
                }
            });

        }
        // REMOVE PRELOADER
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 500); // Remove after transition
        }

        return data;

    } catch (err) {
        console.error('Error in fetchSiteSettings:', err);
        // Ensure preloader is removed even on error
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 500);
        }
        return null;
    }
}

/**
 * Fetches section visibility settings from the dedicated website_sections table
 * and applies them to show/hide the corresponding sections
 * ALL DEFAULTS ARE TRUE (ON) - sections only hide when explicitly set to false
 */
async function fetchWebsiteSections() {
    try {
        const { data, error } = await supabase
            .from('website_sections')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.warn('Could not fetch website sections:', error);
            return;
        }

        if (data) {
            // Cache the section settings globally
            window.currentSectionSettings = data;
            console.log('Website sections fetched:', data);

            // Hero Section
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.style.display = data.show_hero_section === false ? 'none' : '';
            }

            // Product Carousel
            const showcaseSection = document.querySelector('.product-showcase');
            if (showcaseSection) {
                showcaseSection.style.display = data.show_product_carousel === false ? 'none' : '';
            }

            // Our Collections (Product Categories)
            const collectionsSection = document.getElementById('product-categories');
            if (collectionsSection) {
                collectionsSection.style.display = data.show_collections === false ? 'none' : '';
            }

            // Quick Commerce Layout
            if (data.show_quick_layout === true) {
                document.body.classList.add('quick-commerce-mode');
            } else {
                document.body.classList.remove('quick-commerce-mode');
            }

            // Testimonials
            const testimonialsSection = document.querySelector('.testimonials-showcase');
            if (testimonialsSection) {
                testimonialsSection.style.display = data.show_testimonials === false ? 'none' : '';
            }

            // Why Us Section
            const whyUsSection = document.getElementById('why-us-section');
            if (whyUsSection) {
                if (data.show_why_us === false) {
                    whyUsSection.style.display = 'none';
                } else {
                    whyUsSection.style.display = 'block';
                    fetchAndRenderWhyUs();
                }
            }

            // Get In Touch (Contact Form)
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.style.display = data.show_contact_form === false ? 'none' : '';
            }

            // Footer
            const footerSection = document.querySelector('.footer');
            if (footerSection) {
                footerSection.style.display = data.show_footer === false ? 'none' : '';
            }

            console.log('Website sections applied successfully');
        } else {
            console.log('No website_sections data found, using defaults (all visible)');
        }
    } catch (err) {
        console.error('Error fetching website sections:', err);
    }
}

/**
 * Fetches categories from Supabase
 */
async function fetchCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        // Filter out hidden categories globally at fetch level
        return (data || []).filter(cat => cat.is_visible !== false);
    } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
    }
}

/**
 * Fetches products from Supabase and renders them to the DOM
 */
async function fetchAndRenderProducts() {
    try {
        // Parallel fetch for speed
        const [productsResp, categories, imagesResp] = await Promise.all([
            // Fetch products sorted by category and then display_order
            supabase.from('products')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false }),
            fetchCategories(),
            supabase.from('product_images').select('product_id, image_url, tags, is_default')
        ]);

        const products = productsResp.data;
        const productsError = productsResp.error;


        if (productsError) {
            console.error('Supabase Error:', productsError);
            showToast('Error loading products: ' + productsError.message, 'error');
            throw productsError;
        }

        if (!products || products.length === 0) {
            console.log('No products found in database');
            showToast('Database connected but no products found.', 'info');
        }

        // Filter out hidden products
        const visibleProducts = (products || []).filter(p => p.is_visible !== false);

        window.allProductsCache = visibleProducts;
        window.allProductImagesCache = imagesResp.data || [];
        renderProducts(visibleProducts, categories);

        // Re-initialize animations and controls after rendering
        setTimeout(() => {
            initializeScrollAnimations();
            initializeProductShowcaseControls();
            // Re-initialize animations and controls after rendering
            setTimeout(() => {
                initializeScrollAnimations();
                initializeProductShowcaseControls();
                // Trigger Client-Side Routing (for Deep Links)
                handleRouting();
            }, 100);
        }, 100);

    } catch (err) {
        console.error('Error fetching data:', err);
        showToast('System Error: ' + err.message, 'error');
    }
}

/**
 * Renders products into the dynamic category layouts
 * @param {Array} products - Array of product objects
 * @param {Array} categories - Array of category objects
 */
function renderProducts(products, categories) {
    const productScroll = document.getElementById('productScroll');
    const categoriesContainer = document.getElementById('categories-container');

    // 1. Render to Showcase Ticker
    if (productScroll) {
        // Toggle visibility based on newly separated website_sections settings
        // If currentSectionSettings is undefined, fallback to true (default behavior)
        const showTicker = window.currentSectionSettings?.show_product_carousel !== false;
        const showcaseSection = productScroll.closest('.product-showcase');

        if (showcaseSection) {
            showcaseSection.style.display = showTicker ? 'block' : 'none';
        }

        if (showTicker) {
            productScroll.innerHTML = '';

            // Sort products to match Category Order
            let filteredCarouselProducts = [];
            categories.forEach(cat => {
                const catSlug = cat.slug.toLowerCase().trim();
                const catProducts = products.filter(p => {
                    const pCat = (p.product_category || '').toLowerCase().trim();
                    const slugified = pCat.replace(/\s+/g, '-');
                    return pCat === catSlug || slugified === catSlug;
                });
                filteredCarouselProducts.push(...catProducts);
            });

            filteredCarouselProducts.forEach(product => {
                const showcaseItem = document.createElement('div');
                showcaseItem.className = 'product-item';
                showcaseItem.dataset.productId = product.id;

                // Find default image from cache
                const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
                let localImage = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image;

                if (!localImage) {
                    localImage = window.currentSiteSettings?.product_placeholder_url;
                }
                // Optimize for carousel thumbnail size (~200px display)
                const optimizedImage = optimizeImage(localImage, { width: 250 });

                showcaseItem.innerHTML = `
                    <div class="product-image-wrapper">
                        <img src="${optimizedImage}" alt="${product.product_name}" onerror="this.src='${window.currentSiteSettings?.product_placeholder_url}'">
                    </div>
                    <div class="product-info">
                        <h3>${product.product_name}</h3>
                        <p class="telugu-name">${product.product_name_telugu || product.product_tagline || ''}</p>
                    </div>
                    <div class="tap-indicator"><i class="fas fa-plus"></i></div>
                `;

                // Add click handler for quick preview
                showcaseItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.showQuickPreview(product);
                });

                productScroll.appendChild(showcaseItem);
            });

            // Wait for first few images to load before starting carousel (prevents flicker)
            const carouselImages = productScroll.querySelectorAll('img');
            const imagesToPreload = Array.from(carouselImages).slice(0, 4); // First 4 images

            if (imagesToPreload.length > 0) {
                // Hide carousel initially with opacity
                productScroll.style.opacity = '0';
                productScroll.style.transition = 'opacity 0.4s ease-out';

                const imagePromises = imagesToPreload.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                });

                Promise.all(imagePromises).then(() => {
                    // Fade in and start carousel
                    productScroll.style.opacity = '1';
                    initVelocityCarousel(productScroll, 50);
                });

                // Fallback: Start carousel after 2s even if images haven't loaded
                setTimeout(() => {
                    if (productScroll.style.opacity === '0') {
                        productScroll.style.opacity = '1';
                        initVelocityCarousel(productScroll, 50);
                    }
                }, 2000);
            } else {
                initVelocityCarousel(productScroll, 50);
            }
        }
    }

    // 2. Render Categories
    if (categoriesContainer && categories.length > 0) {
        // QUICK COMMERCE LAYOUT CHECK
        // Use newly separated website_sections settings
        if (window.currentSectionSettings?.show_quick_layout) {
            renderQuickLayout(products, categories, categoriesContainer);
            return;
        }

        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            // Filter products for this category
            // Normalize slug and product category string comparison
            const catProducts = products.filter(p => {
                const pCat = (p.product_category || '').toLowerCase().trim().replace(/\s+/g, '-');
                return pCat === category.slug;
            });

            // Create Category Card HTML
            const card = document.createElement('div');
            card.className = 'master-card';
            card.dataset.category = category.slug;

            const cardImage = optimizeImage(category.image_url, { width: 400 }) || `./images/categories/${category.slug}.jpg`;

            card.innerHTML = `
                <div class="card-face card-front">
                    <div class="card-hero-image" style="position: relative;">
                        <img src="${cardImage}" alt="${category.title}" onerror="this.src='./images/placeholder-product-portrait.jpg'">
                        
                        <!-- Sub-brand Overlay -->
                        <div class="sub-brand-overlay">
                             ${category.sub_brand_logo_url
                    ? `<img src="${category.sub_brand_logo_url}" class="sub-brand-logo-overlay-img" alt="${category.sub_brand || 'Sub Brand'}">`
                    : (category.sub_brand ? `<span class="sub-brand-text">${category.sub_brand}</span>` : '')}
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div style="margin-bottom: 0.5rem;">
                            <h3 class="card-title">${category.title}</h3>
                            <p class="telugu-subtitle category-short-desc">${category.short_description || ''}</p>
                        </div>
                        
                        <p class="card-desc">${category.description || ''}</p>
                        <div class="dropdown-wrapper">
                            <div class="custom-dropdown-container">
                                <button class="custom-dropdown-trigger" id="trigger-${category.slug}" onclick="toggleCardDropdown('${category.slug}')">
                                    <span id="label-${category.slug}">Select Product</span> <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="custom-dropdown-menu" id="dropdown-${category.slug}">
                                    <!-- Options populated via JS -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Back Face (Overlay) -->
                <div class="card-face card-back" id="view-${category.slug}"></div>
            `;

            categoriesContainer.appendChild(card);

            // Populate Dropdown
            const selectEl = card.querySelector(`#select-${category.slug}`);
            const viewContainer = card.querySelector(`#view-${category.slug}`);

            // Custom Dropdown Population
            const dropdown = document.getElementById(`dropdown-${category.slug}`);
            if (dropdown) {
                catProducts.forEach(product => {
                    const option = document.createElement('div');
                    option.className = 'custom-option';

                    const telugu = product.product_name_telugu ? ` <span style="font-size:0.85em; opacity:0.8;">(${product.product_name_telugu})</span>` : '';
                    option.innerHTML = `<span>${product.product_name}</span>${telugu}`;

                    option.onclick = (e) => {
                        // Close all dropdowns
                        document.querySelectorAll('.custom-dropdown-menu').forEach(el => el.classList.remove('show'));

                        // Update Trigger Label
                        const label = document.getElementById(`label-${category.slug}`);
                        if (label) label.textContent = product.product_name;

                        // SALES MODE CHECK
                        if (window.currentSiteSettings?.sales_mode_enabled) {
                            window.location.href = `/sales/${product.slug || product.id}`;
                            return;
                        }

                        // Trigger Render Interaction
                        const currentIndex = catProducts.findIndex(p => p.id === product.id);
                        renderOverlayProduct(product, viewContainer, null, card, catProducts, currentIndex);
                    };

                    dropdown.appendChild(option);
                });
            }
        });
    } else if (categoriesContainer) {
        categoriesContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">No categories found.</p>';
    }
}

// Global Dropdown Toggler
window.toggleCardDropdown = function (slug) {
    // Close others
    document.querySelectorAll('.custom-dropdown-menu').forEach(el => {
        if (el.id !== `dropdown-${slug}`) el.classList.remove('show');
    });

    const target = document.getElementById(`dropdown-${slug}`);
    if (target) target.classList.toggle('show');
};

// Close on outside click is handled by document listener elsewhere if needed, or we add one:
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.custom-dropdown-menu').forEach(el => el.classList.remove('show'));
    }
});

function renderOverlayProduct(product, container, selectEl, cardElement, allProducts = [], currentIndex = -1) {
    const contentIngId = `content-ing-${product.id}`;
    const contentNutId = `content-nut-${product.id}`;
    const categoryName = cardElement.dataset.category;
    const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
    let localImage = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image;

    if (!localImage) {
        // Fallback to generic placeholders if no specific image is set
        localImage = window.currentSiteSettings?.product_placeholder_url;
    }

    let nutInfo = {};
    try { nutInfo = typeof product.nutrition_info === 'string' ? JSON.parse(product.nutrition_info) : product.nutrition_info; } catch (e) { nutInfo = {}; }

    // Use sorted variants for consistent display logic
    const variants = window.getSortedVariants(product);

    // Generate quantities text
    let quantitiesText = '';
    if (variants && variants.length > 0) {
        quantitiesText = variants.map(v => v.quantity).join(', ');
    } else {
        quantitiesText = product.net_weight || 'Standard';
    }

    // Navigation Logic
    let navButtons = '';
    if (allProducts.length > 1 && currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + allProducts.length) % allProducts.length;
        const nextIndex = (currentIndex + 1) % allProducts.length;
        const prevProduct = allProducts[prevIndex];
        const nextProduct = allProducts[nextIndex];

        navButtons = `
            <div class="overlay-nav-controls">
                <button class="nav-arrow-btn prev-btn" onclick="navigateNeighbor('${product.id}', '${categoryName}', 'prev')" aria-label="Previous Product">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                <span class="nav-label">Other Products</span>
                <button class="nav-arrow-btn next-btn" onclick="navigateNeighbor('${product.id}', '${categoryName}', 'next')" aria-label="Next Product">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    // HTML Structure for BACK face
    // HTML Structure for BACK face
    container.innerHTML = `
        <div class="back-btn-wrapper">
             <button class="back-btn" onclick="closeOverlay('${cardElement.dataset.category}')">
                <i class="fas fa-arrow-left"></i> Back to ${cardElement.querySelector('.card-title').innerText}
            </button>
        </div>
        <div class="revealed-product">
            <img src="${localImage}" class="revealed-img" alt="${product.product_name}" onerror="this.src='${window.currentSiteSettings?.product_placeholder_url}'">
            <div class="revealed-info">
                <h4>${product.product_name}</h4>
                <p class="revealed-tagline">${product.product_tagline || ''}</p>
                <p class="card-desc" style="margin-bottom: 15px;">${product.product_description || ''}</p>
                
                <div class="info-toggles">
                    ${product.ingredients ? `<button class="toggle-btn" onclick="switchInfoTab('${contentIngId}', this)">Ingredients</button>` : ''}
                    ${Object.keys(nutInfo).length >= 3 ? `<button class="toggle-btn" onclick="switchInfoTab('${contentNutId}', this)">Nutrition</button>` : ''}
                    ${product.serving_suggestion ? `<button class="toggle-btn" onclick="switchInfoTab('content-usage-${product.id}', this)">Usage</button>` : ''}
                </div>

                <div id="${contentIngId}" class="info-content-box" style="display: none;">
                    <strong>Ingredients:</strong><br>
                    ${product.ingredients || ''}
                </div>

                <div id="${contentNutId}" class="info-content-box" style="display: none;">
                    <strong>Nutrition (per serving):</strong><br>
                    ${nutInfo.details ? `<em>${nutInfo.details}</em><br>` : ''}
                    ${nutInfo.calories ? `Calories: ${nutInfo.calories}<br>` : ''}
                    ${nutInfo.protein ? `Protein: ${nutInfo.protein}<br>` : ''}
                    ${nutInfo.satFat ? `Saturated Fat: ${nutInfo.satFat}<br>` : ''}
                    ${nutInfo.fat ? `Total Fat: ${nutInfo.fat}<br>` : ''}
                    ${nutInfo.carbs ? `Carbs: ${nutInfo.carbs}<br>` : ''}
                    ${nutInfo.fiber ? `Fiber: ${nutInfo.fiber}<br>` : ''}
                    ${nutInfo.sugars ? `Sugars: ${nutInfo.sugars}<br>` : ''}
                    ${nutInfo.sodium ? `Sodium: ${nutInfo.sodium}<br>` : ''}
                </div>

                <div id="content-usage-${product.id}" class="info-content-box" style="display: none;">
                    <strong>Usage Instructions:</strong><br>
                    ${product.serving_suggestion || ''}
                </div>

                <div class="variant-info" style="margin-bottom: 20px;">
                    <span style="font-weight: 600; color: var(--text-primary);">Available From: </span>
                    <span style="color: var(--text-secondary);">${quantitiesText}</span>
                </div>

                <button class="add-btn" onclick="window.openWhatsAppCatalog()">
                    <i class="fab fa-whatsapp"></i> Buy on WhatsApp
                </button>
            </div>
            ${navButtons}
        </div>
    `;

    // Trigger Overlay
    // Force a reflow to ensure transitions work if needed, though simple class add is usually fine
    requestAnimationFrame(() => {
        cardElement.classList.add('show-product');
    });
}

// Function to close overlay
window.closeOverlay = function (category) {
    // Note: 'category' here is actually the slug
    // We should probably pass the slug directly or ensure dataset.category is the slug
    // Looking at renderProducts: card.dataset.category = category.slug
    // So 'category' arg IS the slug. Use it to find ID.

    const card = document.querySelector(`.master-card[data-category="${category}"]`);
    if (card) {
        card.classList.remove('show-product');
        // Reset dropdown label
        const label = document.getElementById(`label-${category}`);
        if (label) label.textContent = "Select Product";
    }
};

// Global toggle function
// Global switch tab function
window.switchInfoTab = function (contentId, btn) {
    // 1. Find container of this button
    const container = btn.closest('.revealed-info');

    // 2. Find all content boxes and buttons within this container
    const allBoxes = container.querySelectorAll('.info-content-box');
    const allBtns = container.querySelectorAll('.toggle-btn');
    const targetBox = document.getElementById(contentId);

    // 3. Logic:
    // If clicking an already active tab -> Close it (COLLAPSE)
    // If clicking a new tab -> Close others, Open new one

    const isActive = btn.classList.contains('active');

    // Reset ALL first
    allBoxes.forEach(box => box.style.display = 'none');
    allBtns.forEach(b => b.classList.remove('active'));

    if (!isActive) {
        // Open the target
        targetBox.style.display = 'block';
        btn.classList.add('active');
    }
    // If it WAS active, we did the reset, so now it's closed (Toggle behavior preserved)
};

// Global switch product function
window.switchProduct = function (category, productId) {
    const selectId = `select-${category}`;
    const selectEl = document.getElementById(selectId);
    if (selectEl) {
        selectEl.value = productId;
        // Dispatch event to trigger listeners
        selectEl.dispatchEvent(new Event('change'));
    }
};

/*
========================================
TESTIMONIALS FUNCTIONALITY
========================================
*/

async function fetchAndRenderTestimonials() {
    const testimonialContainer = document.getElementById('testimonialsScroll');
    if (!testimonialContainer) return;

    try {
        console.log('Fetching testimonials...');
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        if (!testimonials || testimonials.length === 0) {
            testimonialContainer.innerHTML = `
                <div class="testimonial-item">
                     <div class="testimonial-content">
                        <p style="text-align: center;">No reviews yet.</p>
                    </div>
                </div>`;
            return;
        }

        testimonialContainer.innerHTML = '';

        // Render function
        const createItem = (t) => {
            const div = document.createElement('div');
            div.className = 'testimonial-item';
            div.innerHTML = `
                <div class="testimonial-content">
                    <div class="stars">${'★'.repeat(t.rating)}</div>
                    <p>"${t.message}"</p>
                    <div class="testimonial-author">
                        <strong>${t.name}</strong>
                        <span>${t.location || ''}</span>
                    </div>
                    ${t.product_name ? `<div class="testimonial-product"><i class="fas fa-tag"></i> ${t.product_name}</div>` : ''}
                </div>
                ${t.review_url ? `<a href="${t.review_url}" target="_blank" rel="noopener noreferrer" class="testimonial-source-icon" onclick="event.stopPropagation()" title="View original review"><i class="fab fa-google"></i></a>` : ''}
             `;

            // Add click handler to open modal
            div.addEventListener('click', () => {
                window.openTestimonialDetail(t);
            });

            return div;
        };

        testimonials.forEach(t => {
            testimonialContainer.appendChild(createItem(t));
        });

        // Create "Base Set" that is wide enough
        // Ensure content fills at least 1.5 screen widths (for mobile safety) before doubling
        const minBaseWidth = Math.max(window.innerWidth * 1.5, 600);
        let currentBaseWidth = testimonialContainer.scrollWidth;
        const originalItems = Array.from(testimonialContainer.children);

        // Fill base set if too small (e.g. only 1 or 2 reviews)
        // Fill base set if too small (e.g. only 1 or 2 reviews)
        // CRITICAL FIX: If section is hidden, scrollWidth is 0. Check for this to prevent infinite loop.
        if (currentBaseWidth > 0) {
            while (currentBaseWidth < minBaseWidth && originalItems.length > 0) {
                originalItems.forEach(item => {
                    testimonialContainer.appendChild(item.cloneNode(true));
                });
                // Re-measure roughly (accumulating width)
                currentBaseWidth = testimonialContainer.scrollWidth;

                // Safety break to prevent infinite loop if width doesn't increase
                if (testimonialContainer.children.length > 50) break;
            }
        }

        // Now Create [A, A] Structure for 50% reset logic
        // We clone the ENTIRE current base set once
        const baseSet = Array.from(testimonialContainer.children);
        baseSet.forEach(item => testimonialContainer.appendChild(item.cloneNode(true)));

        // Initialize velocity-based carousel
        initVelocityCarousel(testimonialContainer, 40);

    } catch (error) {
        console.error('Error fetching testimonials:', error);
        testimonialContainer.innerHTML = `
            <div class="testimonial-item">
                 <div class="testimonial-content">
                    <p style="color: red; text-align: center;">Unable to load reviews.</p>
                </div>
            </div>`;
    }
}

// Testimonial Modal Functions
window.openTestimonialDetail = function (testimonial) {
    const overlay = document.getElementById('testimonialDetailOverlay');
    const modal = document.getElementById('testimonialDetailModal');
    const starsEl = document.getElementById('testimonialModalStars');
    const messageEl = document.getElementById('testimonialModalMessage');
    const nameEl = document.getElementById('testimonialModalName');
    const locationEl = document.getElementById('testimonialModalLocation');
    const linkEl = document.getElementById('testimonialModalLink');

    if (!modal || !overlay) return;

    // Populate modal
    starsEl.textContent = '★'.repeat(testimonial.rating || 5);
    messageEl.textContent = `"${testimonial.message}"`;
    nameEl.textContent = testimonial.name;
    locationEl.textContent = testimonial.location || '';

    // Show/hide review link
    if (testimonial.review_url) {
        linkEl.href = testimonial.review_url;
        linkEl.style.display = 'inline-flex';
    } else {
        linkEl.style.display = 'none';
    }

    // Show modal
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeTestimonialDetail = function () {
    const overlay = document.getElementById('testimonialDetailOverlay');
    const modal = document.getElementById('testimonialDetailModal');

    if (overlay) overlay.classList.remove('active');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
};

// Close on Escape key for testimonial modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeTestimonialDetail();
    }
});

/**
 * Renders the Quick Commerce Grid Layout
 */
/**
 * Renders the Quick Commerce Layout (Desktop Grid + Mobile Tabs)
 */
/**
 * Renders the Quick Commerce Layout (Unified Vertical List with Horizontal Scroll)
 */
/**
 * Checks for text truncation in category cards and toggles arrow visibility
 */


function renderQuickLayout(products, categories, container) {
    container.innerHTML = '';
    const showMrp = window.currentSiteSettings?.show_mrp !== false;

    // Create a unified wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'quick-layout-grid unified-layout';

    // Filter categories that have products
    const activeCategories = categories.filter(cat => {
        const targetSlug = cat.slug.toLowerCase().trim();
        return products.some(p => {
            const rawCat = (p.product_category || '').toLowerCase().trim();
            const slugified = rawCat.replace(/\s+/g, '-');
            return rawCat === targetSlug || slugified === targetSlug || rawCat === cat.id;
        });
    });

    if (activeCategories.length === 0) {
        container.innerHTML = '<p class="text-center">No products found for Quick Commerce.</p>';
        return;
    }

    // Iterate through categories and create sections
    activeCategories.forEach((cat) => {
        const catProducts = getProductsForCategory(products, cat);

        // Build Grid Card (Unified)
        const card = document.createElement('div');
        // Use half-width for categories with ≤5 products, full-width otherwise
        const isSmallCategory = catProducts.length <= 5;
        card.className = `quick-card ${isSmallCategory ? 'half-width' : 'span-full'}`;
        const productsHTML = renderQuickProductsHTML(catProducts, showMrp);

        // Sub-brand logo HTML - in square container with background
        const subBrandLogoHTML = cat.sub_brand_logo_url
            ? `<div class="quick-sub-brand-container"><img src="${cat.sub_brand_logo_url}" class="quick-sub-brand-logo" alt="${cat.sub_brand || 'Sub Brand'}" onerror="this.parentElement.style.display='none'"></div>`
            : '<div class="quick-sub-brand-placeholder"></div>';

        card.innerHTML = `
            <div class="quick-header-row">
                <div class="quick-header-left">
                    ${subBrandLogoHTML}
                    <div class="quick-header-text">
                        <h3>${cat.title}</h3>
                        ${cat.sub_brand ? `<p class="quick-category-tagline">${cat.sub_brand}</p>` : ''}
                        <p class="quick-subtitle category-short-desc">${cat.short_description || ''}</p>
                    </div>
                </div>
                <!-- Independent View All Button Positioned via CSS -->
                <div class="quick-header-action">
                    <a href="/sales/${cat.slug}" onclick="handleLinkClick(event, '/sales/${cat.slug}')" class="view-all-link mobile-compact-btn">View All <i class="fas fa-chevron-right"></i></a>
                </div>
            </div>
            <div class="quick-product-scroll" id="scroll-${cat.slug}">
                ${productsHTML}
            </div>
        `;
        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);

    // Initialize Drag Scroll for All Lists
    setTimeout(() => {
        // Quick Commerce
        document.querySelectorAll('.quick-product-scroll').forEach(el => {
            enableDragScroll(el);
        });
        // Main Product Ticker
        document.querySelectorAll('.product-scroll').forEach(el => enableDragScroll(el));
        // Testimonials
        document.querySelectorAll('.testimonial-container').forEach(el => enableDragScroll(el));
    }, 500);
}

/**
 * Enables drag-to-scroll functionality for desktop mouse interactions
 * @param {HTMLElement} slider - The scroll container element
 */
/**
 * Enables drag-to-scroll functionality for both mouse and touch
 * @param {HTMLElement} slider - The scroll container element
 */
function enableDragScroll(slider) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse Events
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        // Pause animation on interaction
        slider.style.animationPlayState = 'paused';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        e.preventDefault();
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
        // Resume animation
        slider.style.animationPlayState = 'running';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        // Resume animation
        slider.style.animationPlayState = 'running';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });

    // Touch Events (Mobile)
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        slider.classList.add('active');
        // Pause animation on interaction
        slider.style.animationPlayState = 'paused';
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        // Don't prevent default here to allow vertical scroll if needed (browser handles it, but we capture horizontal)
    }, { passive: true });

    slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('active');
        // Resume animation
        slider.style.animationPlayState = 'running';
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
        // Prevent default only if scrolling horizontally to avoid blocking vertical scroll
        if (Math.abs(walk) > 5) {
            if (e.cancelable) e.preventDefault();
        }
    }, { passive: false });
}

/**
 * Updates scroll animation speeds dynamically based on content length
 * Ensures consistent speed regardless of number of items
 */
function updateScrollSpeeds() {
    // User Requested: Universal 2.5s per card irrespective of device or type
    const secondsPerCard = 2.5;

    // 1. Main Product Ticker (Duplicated content)
    document.querySelectorAll('.product-scroll').forEach(el => {
        // Items are duplicated, so effective count is half
        const count = el.children.length / 2;
        if (count > 0) {
            const duration = count * secondsPerCard;
            el.style.animationDuration = `${duration}s`;
        }
    });

    // 2. Testimonial Ticker (Duplicated content)
    // FIX: Correct selector is .testimonials-scroll, not .testimonial-container
    document.querySelectorAll('.testimonials-scroll').forEach(el => {
        const count = el.children.length / 2;
        if (count > 0) {
            // Using same speed logic as Product Carousel (2.5s per card)
            const duration = count * secondsPerCard;
            el.style.animationDuration = `${duration}s`;
        }
    });

    // 3. Quick Commerce Ticker (Non-duplicated? or Duplicated?)
    // In renderQuickLayout, we didn't duplicate. If we want infinite scroll, we should?
    // Current CSS relies on quick-scroll-track going 100% -> -100%. 
    // This traverses 200% width.
    document.querySelectorAll('.quick-scroll-track').forEach(el => {
        const count = el.children.length; // Assuming no dupes yet
        if (count > 0) {
            // Speed for 100% -> -100% (2x distance) might need adjustment
            // But user wants "timer for one card to pass".
            const duration = count * secondsPerCard;
            el.style.animationDuration = `${duration}s`;
        }
    });

    // Fallback for .quick-product-scroll if track not found (depending on HTML structure)
    document.querySelectorAll('.quick-product-scroll').forEach(el => {
        // Only apply if it doesn't have a track child handling it
        if (!el.querySelector('.quick-scroll-track')) {
            const count = el.children.length;
            if (count > 0) el.style.animationDuration = `${count * secondsPerCard}s`;
        }
    });
}

// Call on load and resize
window.addEventListener('load', updateScrollSpeeds);
window.addEventListener('resize', () => {
    // Debounce slightly
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(updateScrollSpeeds, 200);
});


/**
 * Filter Helper
 */
function getProductsForCategory(products, category) {
    const targetSlug = category.slug.toLowerCase().trim();
    return products.filter(p => {
        const rawCat = (p.product_category || '').toLowerCase().trim();
        const slugified = rawCat.replace(/\s+/g, '-');
        return rawCat === targetSlug || slugified === targetSlug || rawCat === category.id;
    });
}

/**
 * HTML Generator Helper
 */
function renderQuickProductsHTML(products, showMrp) {
    if (!products.length) return '<p class="text-muted">No products.</p>';

    return products.map(product => {
        const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
        let localImage = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image;
        if (!localImage || localImage.trim() === '') localImage = window.currentSiteSettings?.product_placeholder_url;
        const fallbackImg = window.currentSiteSettings?.product_placeholder_url || './images/placeholder-product.jpg';

        let variants = [];
        try { variants = typeof product.quantity_variants === 'string' ? JSON.parse(product.quantity_variants) : product.quantity_variants; } catch (e) { variants = []; }

        let priceDisplay = product.mrp || 0;
        let qtyDisplay = product.net_weight || '';

        if (variants && variants.length > 0) {
            // Sort by price (ascending) to show cheapest
            variants.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            priceDisplay = variants[0].price; // Sales Price
            qtyDisplay = variants[0].quantity;
        }

        // Escape single quotes in product name for the argument
        const pId = product.id;

        const extraClass = showMrp ? '' : 'no-price';

        return `
        <div class="quick-product-item ${extraClass}" onclick="window.openQuickProductModal('${pId}')">
            <div class="quick-product-image-wrapper">
                <img src="${localImage}" 
                        alt="${product.product_name}" 
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${fallbackImg}';">
            </div>
            
            <div class="quick-product-item-info">
                <h4>${product.product_name}</h4>
                <p class="telugu-name">${product.product_name_telugu || ''}</p>
                <div class="weight">${qtyDisplay}</div>
                ${showMrp ? `<div class="price-row">
                    <span class="price">₹${priceDisplay}</span>
                    ${qtyDisplay ? `<span class="variant-qty">(${qtyDisplay})</span>` : ''}
                    ${product.mrp && product.mrp > priceDisplay ? `<span class="mrp-strike">₹${product.mrp}</span>` : ''}
                </div>` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// ----------------------------------------------------
// QUICK PRODUCT MODAL LOGIC
// ----------------------------------------------------

window.openQuickProductModal = function (productId) {
    if (window.currentSiteSettings?.sales_mode_enabled) {
        const product = (window.allProductsCache || []).find(p => String(p.id) === String(productId));
        window.location.href = `/sales/${product?.slug || productId}`;
        return;
    }

    // Ensure we have a cache
    const cache = window.allProductsCache || [];

    // loose comparison or string conversion to be safe
    const currentIndex = cache.findIndex(p => String(p.id) === String(productId));

    if (currentIndex === -1) return;

    const product = cache[currentIndex];

    // Navigation Indices (Looping)
    const prevIndex = (currentIndex - 1 + cache.length) % cache.length;
    const nextIndex = (currentIndex + 1) % cache.length;
    const prevId = cache[prevIndex].id;
    const nextId = cache[nextIndex].id;

    // 2. Remove ANY existing modals to prevent duplicates (Nuclear Fix)
    const existingModals = document.querySelectorAll('#quickProductModal');
    existingModals.forEach(m => m.remove());

    // 3. Create Fresh Modal
    let modal = document.createElement('div');
    modal.id = 'quickProductModal';
    modal.className = 'quick-product-detail-modal';
    document.body.appendChild(modal);

    // Add Listeners
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Global ESC Listener (Note: Adding this repeatedly is bad if we don't clean it up, 
    // but anonymous functions can't be removed easily. 
    // Better to add a named function or check if listener exists? 
    // Or just attach ONCE to document. 
    // Actually, if we attach to document every time we open, we get stack of listeners.
    // Let's attach to the MODAL itself (tabindex) or handle document logic globally ONCE.
    // For now, let's just use a simple check or attach to document OUTSIDE function.
    // OR, attach 'keydown' to window only once.
    // Let's rely on the previous singleton logic for the LISTENER, but we removed the modal.
    // We should put the listener logic OUTSIDE this function to be safe.

    // Prepare Content
    const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
    let localImage = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image;
    if (!localImage || localImage.trim() === '') localImage = window.currentSiteSettings?.product_placeholder_url;
    const fallbackImg = window.currentSiteSettings?.product_placeholder_url || './images/placeholder-product.jpg';

    let variants = [];
    try { variants = typeof product.quantity_variants === 'string' ? JSON.parse(product.quantity_variants) : product.quantity_variants; } catch (e) { variants = []; }
    let quantitiesText = variants.length > 0 ? variants.map(v => v.quantity).join(', ') : (product.net_weight || 'Standard');

    let nutInfo = {};
    try { nutInfo = typeof product.nutrition_info === 'string' ? JSON.parse(product.nutrition_info) : product.nutrition_info; } catch (e) { nutInfo = {}; }

    // IDs for toggles
    const contentIngId = `q-content-ing-${product.id}`;
    const contentNutId = `q-content-nut-${product.id}`;
    const contentUsageId = `q-content-usage-${product.id}`;

    modal.innerHTML = `
        <div class="quick-modal-content">
            <button class="quick-modal-close" onclick="document.getElementById('quickProductModal').style.display='none'">&times;</button>
            
            <div class="quick-modal-body revealed-info"> <!-- Added revealed-info class for switchInfoTab comaptibility -->
                <img src="${localImage}" alt="${product.product_name}" onerror="this.src='${fallbackImg}'">
                <h3>${product.product_name}</h3>
                <p class="quick-modal-tagline">${product.product_tagline || ''}</p>
                <p class="quick-modal-desc">${product.product_description || ''}</p>
                
                <!-- Toggles Container -->
                <div class="info-toggles quick-toggles">
                    ${product.ingredients ? `<button class="toggle-btn" onclick="switchInfoTab('${contentIngId}', this)">Ingredients</button>` : ''}
                    ${Object.keys(nutInfo).length >= 3 ? `<button class="toggle-btn" onclick="switchInfoTab('${contentNutId}', this)">Nutrition</button>` : ''}
                    ${product.serving_suggestion ? `<button class="toggle-btn" onclick="switchInfoTab('${contentUsageId}', this)">Usage</button>` : ''}
                </div>

                <!-- Content Sections -->
                <div id="${contentIngId}" class="info-content-box" style="display: none;">
                    <strong>Ingredients:</strong><br>${product.ingredients || ''}
                </div>

                <div id="${contentNutId}" class="info-content-box" style="display: none;">
                    <strong>Nutrition:</strong><br>
                    ${nutInfo.calories ? `Calories: ${nutInfo.calories}<br>` : ''}
                    ${nutInfo.protein ? `Protein: ${nutInfo.protein}<br>` : ''}
                    ${nutInfo.fat ? `Fat: ${nutInfo.fat}<br>` : ''}
                </div>

                <div id="${contentUsageId}" class="info-content-box" style="display: none;">
                    <strong>Usage:</strong><br>${product.serving_suggestion || ''}
                </div>

                <div class="quick-modal-footer">
                     <div class="variant-info">
                        <strong>Available:</strong> ${quantitiesText}
                    </div>
                    <button class="whatsapp-buy-btn" onclick="window.openWhatsAppCatalog()">
                        <i class="fab fa-whatsapp"></i> Buy on WhatsApp
                    </button>
                </div>

                <!-- Navigation -->
                <div class="quick-modal-nav">
                    <button class="nav-arrow-btn prev-btn" onclick="window.openQuickProductModal('${prevId}')">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="nav-label">${currentIndex + 1} / ${cache.length}</span>
                    <button class="nav-arrow-btn next-btn" onclick="window.openQuickProductModal('${nextId}')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // 4. Show Modal
    modal.style.display = 'flex';
};

/**
 * Switch Tab Function
 */
window.switchQuickTab = function (slug) {
    // Update Buttons
    document.querySelectorAll('.cat-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active'); // Assumes triggered by click event

    // Update Panes
    document.querySelectorAll('.quick-tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`tab-pane-${slug}`)?.classList.add('active');
}

/**
 * Fetch and Render "Why Us" Features
 */
async function fetchAndRenderWhyUs() {
    const container = document.getElementById('why-us-features');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('why_us_features')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            container.innerHTML = data.map(f => `
                <div class="why-feature-card">
                    <img src="${f.image_url}" alt="${f.title}" class="why-feature-img" onerror="this.src=window.siteSettings?.product_placeholder_url || ''">
                    <div class="why-feature-content">
                        <h3 class="why-feature-title">${f.title}</h3>
                        <p class="why-feature-desc">${f.description || ''}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Error fetching Why Us features:', e);
    }
}


// ----------------------------------------------------
// GLOBAL EVENT LISTENERS
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Wire up Main Navigation WhatsApp Button
    // Note: ID-based selector finds first match, but we have multiple IDs potentially?
    // Actually IDs should be unique. But we might have separate IDs for desktop/mobile.
    const waBtns = document.querySelectorAll('#whatsappBtn, #mobileWhatsappBtn');
    waBtns.forEach(btn => {
        btn.onclick = function () {
            window.openWhatsAppCatalog();
        };
    });
});

// Explicitly expose for onclick attributes if any
window.openWhatsAppCatalog = function () {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        window.open(WHATSAPP_CATALOG_URL, '_blank');
    } else {
        window.open(WHATSAPP_DESKTOP_URL, '_blank');
    }
};



/**
 * ------------------------------------------------------------------
 * Refactored Next/Previous Logic (Neighbor Search)
 * Per User Requirement: Uses specific Supabase queries to find neighbors
 * based on display_order rather than array index.
 * ------------------------------------------------------------------
 */
window.navigateNeighbor = async function (currentId, categorySlug, direction) {
    // 1. Get Current Product Details
    const currentProduct = (window.allProductsCache || []).find(p => String(p.id) === String(currentId));

    if (!currentProduct) {
        console.error("Current product not found in cache for navigation.");
        return;
    }

    const isNext = direction === 'next';
    const currentOrder = currentProduct.display_order !== null ? currentProduct.display_order : 0;

    // 2. Build the Query
    // Logic: Same Category AND Greater/Less than current display_order
    let query = supabase
        .from('products')
        .select('id')
        .eq('product_category', currentProduct.product_category);

    if (isNext) {
        // Find next: > display_order, Order Ascending (get the closest larger value)
        query = query
            .gt('display_order', currentOrder)
            .order('display_order', { ascending: true });
    } else {
        // Find prev: < display_order, Order Descending (get the closest smaller value)
        query = query
            .lt('display_order', currentOrder)
            .order('display_order', { ascending: false });
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
        console.error("Error fetching neighbor product:", error);
        return;
    }

    if (data) {
        // Found a direct neighbor
        window.switchProduct(categorySlug, data.id);
    } else {
        // 3. Loop Logic (Fallback)
        let loopQuery = supabase
            .from('products')
            .select('id')
            .eq('product_category', currentProduct.product_category);

        if (isNext) {
            loopQuery = loopQuery.order('display_order', { ascending: true });
        } else {
            loopQuery = loopQuery.order('display_order', { ascending: false });
        }

        const { data: loopData } = await loopQuery.limit(1).maybeSingle();
        if (loopData && loopData.id !== currentId) {
            window.switchProduct(categorySlug, loopData.id);
        }
    }
};

/*
========================================
MAIN PAGE CART FUNCTIONALITY
Cart drawer for main index page - syncs with sales page cart
========================================
*/

// Toggle Main Cart Drawer
window.toggleMainCartDrawer = function () {
    const drawer = document.getElementById('mainCartDrawer');
    const overlay = document.getElementById('mainCartOverlay');
    if (!drawer || !overlay) return;

    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    } else {
        window.updateMainCartUI(); // Refresh before showing
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

// Update Main Cart UI from localStorage
window.updateMainCartUI = function () {
    const cart = JSON.parse(localStorage.getItem('td_cart') || '[]');

    // Update Badges
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    const mainCartCount = document.getElementById('mainCartCount');
    const mainCartBtn = document.getElementById('mainCartBtn');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    const mobileShareCatalogueBtn = document.getElementById('mobileShareCatalogueBtn');
    const clearBtn = document.getElementById('mainClearCartBtn');

    // Desktop: Show cart button only when cart has items
    if (mainCartBtn) {
        mainCartBtn.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (mainCartCount) {
        mainCartCount.innerText = totalQty;
        mainCartCount.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (mobileCartCount) {
        mobileCartCount.innerText = totalQty;
        mobileCartCount.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    // Mobile: Toggle between cart and share catalogue in header
    // Also toggle share catalogue in hamburger menu
    const hamburgerShareCatalogueBtn = document.getElementById('hamburgerShareCatalogueBtn');

    if (mobileCartBtn && mobileShareCatalogueBtn) {
        if (totalQty > 0) {
            // Cart has items: Show cart in header, Share Catalogue in hamburger
            mobileCartBtn.style.display = 'flex';
            mobileShareCatalogueBtn.style.display = 'none';
            if (hamburgerShareCatalogueBtn) {
                hamburgerShareCatalogueBtn.style.display = 'flex';
            }
        } else {
            // Cart is empty: Show Share Catalogue in header, hide it in hamburger
            mobileCartBtn.style.display = 'none';
            mobileShareCatalogueBtn.style.display = 'flex';
            if (hamburgerShareCatalogueBtn) {
                hamburgerShareCatalogueBtn.style.display = 'none';
            }
        }
    }

    // Show/Hide Clear Button
    if (clearBtn) {
        clearBtn.style.display = cart.length > 0 ? 'block' : 'none';
    }

    // Update Drawer Items
    const cartItems = document.getElementById('mainCartItems');
    const cartTotal = document.getElementById('mainCartTotal');

    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
        if (cartTotal) cartTotal.innerText = '0';
        return;
    }

    let total = 0;
    if (cartItems) {
        cartItems.innerHTML = cart.map((item, index) => {
            const itemTotal = (item.price || 0) * (item.qty || 0);
            total += itemTotal;
            const variantLabel = item.variant ? `<div class="cart-item-variant">${item.variant.quantity}</div>` : '';

            return `
                <div class="cart-item">
                    <img src="${item.image || ''}" alt="${item.name || 'Product'}" onerror="this.style.display='none'">
                    <div class="cart-item-details">
                        <h4>${item.name || 'Product'}</h4>
                        ${variantLabel}
                        <div class="cart-item-price">₹${item.price || 0} x ${item.qty || 0} = ₹${itemTotal}</div>
                        <div class="cart-item-controls">
                            <button onclick="window.updateMainCartQty(${index}, -1)">−</button>
                            <span>${item.qty || 0}</span>
                            <button onclick="window.updateMainCartQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="window.removeMainCartItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    if (cartTotal) cartTotal.innerText = total;
};

// Update quantity for an item in main cart
window.updateMainCartQty = function (index, delta) {
    const cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    if (!cart[index]) return;

    cart[index].qty = (cart[index].qty || 0) + delta;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('td_cart', JSON.stringify(cart));
    window.updateMainCartUI();
};

// Remove item from main cart
window.removeMainCartItem = function (index) {
    const cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('td_cart', JSON.stringify(cart));
    window.updateMainCartUI();
    window.showToast('Item removed from cart', 'info');
};

// Clear entire main cart
window.clearMainCart = function () {
    localStorage.setItem('td_cart', JSON.stringify([]));
    window.updateMainCartUI();
    // Also reset quick preview cart UI if popup is open
    if (typeof window.updateQuickPreviewCartUI === 'function') {
        window.updateQuickPreviewCartUI();
    }
    window.showToast('Cart cleared', 'info');
};

// Order from WhatsApp
window.orderOnWhatsApp = async function () {
    const cart = JSON.parse(localStorage.getItem('td_cart') || '[]');
    if (cart.length === 0) {
        window.showToast('Your cart is empty!', 'error');
        return;
    }

    // Show loading state
    window.showToast('Preparing your order...', 'info');

    // optional: validation logic can be added here if needed, 
    // but for the main page we keep it fast and simple.

    // Construct Message
    let message = `👋 Hi Telugu Delicacies! I would like to place an order.\n\n🛒 *ORDER SUMMARY*`;
    let total = 0;
    cart.forEach(item => {
        const sub = (item.price || 0) * (item.qty || 0);
        total += sub;
        message += `\n▪️ ${item.name} ${item.variant ? '(' + item.variant.quantity + ')' : ''} x ${item.qty} = ₹${sub}`;
    });

    message += `\n\n💰 *Item Total: ₹${total}* (Shipping calculated later)`;
    message += `\n\nPlease confirm availability and share payment details! ✅`;

    const phone = WHATSAPP_NUMBER || '919618519191';

    // Use web.whatsapp for desktop, api.whatsapp for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    const whatsappUrl = `${baseUrl}?phone=${phone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    // Immediate Actions
    window.clearMainCart(); // Handles reset and toast
    window.showToast('Thanks for the order! Cart cleared.', 'success');

    // Close the cart drawer
    window.toggleMainCartDrawer();
};

// Initialize cart UI on page load (delegated to main init; only update UI here)
document.addEventListener('DOMContentLoaded', function () {
    // Cart UI update is handled after products load in main init
    // This listener now only handles cart-specific cross-tab sync
    setTimeout(() => {
        window.updateMainCartUI();
    }, 500); // Delay slightly to ensure main init has completed
});

// Listen for storage changes (cross-tab sync)
window.addEventListener('storage', function (e) {
    if (e.key === 'td_cart') {
        window.updateMainCartUI();
        if (typeof window.updateQuickPreviewCartUI === 'function') {
            window.updateQuickPreviewCartUI();
        }
    }
});
// ========================================
// WEBSITE SECTION REORDERING LOGIC
// ========================================
async function applySectionOrder() {
    try {
        const { data: settings, error } = await supabase.from('website_sections').select('section_order').single();
        if (error || !settings || !settings.section_order) return;

        const order = settings.section_order;
        if (!Array.isArray(order) || order.length === 0) return;

        const heroSection = document.getElementById('sec-hero'); // Usually fixed at top, but let's allow reorder if requested
        const parent = heroSection ? heroSection.parentNode : document.body;

        // We only want to reorder specific sections that are siblings in the main flow
        // The main container in index.html is actually Body -> Header, Hero, Ticker, etc.
        // So we can reorder children of Body or a Main wrapper if it existed.
        // In current HTML, sections are direct children of Body (after Header).

        // Identify the reference point (e.g., after Header)
        const header = document.querySelector('header');

        // Create a fragment to hold ordered elements
        const fragment = document.createDocumentFragment();

        order.forEach(id => {
            const el = document.getElementById(id);
            if (el) fragment.appendChild(el);
        });

        // Insert after header (or prepend if header missing)
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(fragment, header.nextSibling);
        } else {
            document.body.prepend(fragment);
        }

    } catch (e) {
        console.warn('Section reordering failed:', e);
    }
}

// Call efficiently on load (concurrent with other inits)
// Add to the existing DOMContentLoaded listener or just run it script-end if Supabase is ready
// Since script is module type, we can run it top-level
applySectionOrder();
