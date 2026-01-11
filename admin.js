
import { supabase } from './lib/supabase.js';
window.supabase = supabase; // Expose globally for other scripts (like csv_manager.js)

// Helper: Generate URL-friendly slug from product name
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-');          // Remove consecutive hyphens
}

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const productList = document.getElementById('productListContainer');
const testimonialList = document.getElementById('testimonialList');
const productModal = document.getElementById('productModal');
const testimonialModal = document.getElementById('testimonialModal');
const productForm = document.getElementById('productForm');

// Constants
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' dominant-baseline='middle' text-anchor='middle'%3EImg%3C/text%3E%3C/svg%3E";
window.PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;
const testimonialForm = document.getElementById('testimonialForm');
const variantsContainer = document.getElementById('variantsContainer');
const modalTitle = document.getElementById('modalTitle');
const testimonialModalTitle = document.getElementById('testimonialModalTitle');
const productsTableContainer = document.getElementById('productsTableContainer');
const testimonialsTableContainer = document.getElementById('testimonialsTableContainer');
const viewWhyUsBtn = document.getElementById('viewWhyUsBtn');
const whyUsTableContainer = document.getElementById('whyUsTableContainer');
const whyUsFeatureList = document.getElementById('whyUsFeatureList');
const featureModal = document.getElementById('featureModal');
const featureForm = document.getElementById('featureForm');
const featureModalTitle = document.getElementById('featureModalTitle');
const addBtnText = document.getElementById('addBtnText');
const sectionsContainer = document.getElementById('sectionsContainer');
const viewSectionsBtn = document.getElementById('viewSectionsBtn');

// Global State
let allProducts = [];
let allCategories = [];
let allTestimonials = [];
let currentView = 'products';
let currentUser = null; // Restore missing variable
let editSnapshot = {}; // Stores original state for diffing

// Helper: Deep Loose Equality Check
function isLooseEqual(v1, v2) {
    // Normalize null/undefined/empty string
    if ((v1 === null || v1 === undefined) && v2 === '') return true;
    if ((v2 === null || v2 === undefined) && v1 === '') return true;
    if (v1 === null && v2 === undefined) return true;
    if (v2 === null && v1 === undefined) return true;

    // Primitives with loose equality (100 == "100")
    if (v1 == v2) return true;

    // Safe type check
    if (typeof v1 !== typeof v2 && v1 != v2) return false; // Different types and not loosely equal

    // Objects / Arrays
    if (typeof v1 === 'object' && v1 !== null && v2 !== null) {
        // Different constructors (Array vs Object)?
        if (v1.constructor !== v2.constructor) return false;

        const keys1 = Object.keys(v1);
        const keys2 = Object.keys(v2);

        // Check if all keys in v1 exist in v2 and match
        for (const key of keys1) {
            if (!isLooseEqual(v1[key], v2[key])) return false;
        }

        // Check if all keys in v2 exist in v1 (to catch extra keys in current)
        for (const key of keys2) {
            if (!isLooseEqual(v1[key], v2[key])) return false;
        }

        return true;
    }

    return false;
}

// Helper: Get Changed Fields
function getChanges(original, current) {
    if (!original) return ['Created New Item'];
    const changes = [];
    for (const key in current) {
        if (!isLooseEqual(original[key], current[key])) {
            // Format key for display
            const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
            changes.push(label);
        }
    }
    return changes.length > 0 ? changes : ['No Changes Detected'];
}

// Helper: Toast Notification
window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div>
            <div class="toast-top-text">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}</div>
            <div class="toast-body">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Auto Logout Timer (30 mins)
    let logoutTimer;
    const resetLogoutTimer = () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        // Only set timer if user is potentially logged in (we check dashboard visibility inside timeout for safety)
        logoutTimer = setTimeout(() => {
            if (document.getElementById('dashboardSection').style.display !== 'none') {
                handleLogout();
                showToast('Session timed out due to inactivity.', 'error');
            }
        }, 30 * 60 * 1000);
    };

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt =>
        document.addEventListener(evt, resetLogoutTimer)
    );
    resetLogoutTimer();

    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        showDashboard();
    } else {
        showLogin();
    }

    // Check for file protocol
    if (window.location.protocol === 'file:') {
        const warning = document.createElement('div');
        warning.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #fff3cd; color: #856404; padding: 10px; text-align: center; z-index: 9999; border-bottom: 1px solid #ffeeba;';
        warning.innerHTML = '<strong>Warning:</strong> You are running this file directly (file://). Features like Login and Database connection will NOT work due to browser security. Please use <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a>.';
        document.body.prepend(warning);
    }

    // Attach Login Listener manually
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Auth State Change Listener
    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            currentUser = session.user;
            showDashboard();
        } else {
            currentUser = null;
            showLogin();
        }
    });

    // AUTO-SLUG GENERATION LISTENERS
    // Product Slug
    const prodNameInput = document.getElementById('productName');
    const prodSlugInput = document.getElementById('productSlug');
    if (prodNameInput && prodSlugInput) {
        prodNameInput.addEventListener('input', () => {
            // Only auto-fill if slug is empty or was previously auto-generated (implied by user not manually editing it? 
            // distinct tracking is hard, so we just check if it's empty or matches the old likely slug)
            // Simpler: Just auto-fill if slug is empty. User can overwrite.
            if (!prodSlugInput.value) {
                prodSlugInput.value = generateSlug(prodNameInput.value);
            }
        });
        // Optional: Force a "Re-generate" button or just let them type. 
        // Better UX: If they haven't touched the slug input, keep it synced. 
        // But for now, simple "fill on empty" or "fill on blur" is improved enough.
        prodNameInput.addEventListener('blur', () => {
            if (!prodSlugInput.value) prodSlugInput.value = generateSlug(prodNameInput.value);
        });
    }

    // Category Slug
    const catNameInput = document.getElementById('catTitle');
    const catSlugInput = document.getElementById('catSlug');
    if (catNameInput && catSlugInput) {
        catNameInput.addEventListener('input', () => {
            if (!catSlugInput.value) {
                catSlugInput.value = generateSlug(catNameInput.value);
            }
        });
        catNameInput.addEventListener('blur', () => {
            if (!catSlugInput.value) catSlugInput.value = generateSlug(catNameInput.value);
        });
    }
});

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted'); // Debug log

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with:', email); // Debug log

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Supabase login error:', error); // Debug log
            throw error;
        }

        console.log('Login successful:', data); // Debug log
        // Auth listener will handle UI switch
    } catch (error) {
        console.error('Login catch block:', error); // Debug log
        showToast('Login failed: ' + error.message, 'error');
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) console.warn('Logout warning:', error);
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        // Force local state cleanup regardless of server response
        currentUser = null;
        showLogin();
    }
}

const siteSettingsForm = document.getElementById('settingsForm');
const categoryForm = document.getElementById('categoryForm');
const categoryList = document.getElementById('categoryList');
const categoriesTableContainer = document.getElementById('categoriesTableContainer');
const settingsContainer = document.getElementById('settingsContainer');
const viewCategoriesBtn = document.getElementById('viewCategoriesBtn');
const viewSettingsBtn = document.getElementById('viewSettingsBtn');
const categoryModal = document.getElementById('categoryModal');
const catModalTitle = document.getElementById('catModalTitle');
const productCategorySelect = document.getElementById('productCategory');

// Show Login
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    if (loginForm) loginForm.reset();
}

// UI Switching
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';

    // Call switchView to properly initialize the UI (show/hide filters, etc.)
    switchView(currentView);
}

window.switchView = (view) => {
    currentView = view;

    // Elements
    const filterRow = document.getElementById('productFilterRow');
    const addBtn = document.getElementById('addBtn');
    const saveOrderBtn = document.getElementById('saveOrderBtn');

    // Hide all Containers
    if (productList) productList.style.display = 'none';
    if (testimonialsTableContainer) testimonialsTableContainer.style.display = 'none'; // Name might change in refactor
    if (categoriesTableContainer) categoriesTableContainer.style.display = 'none'; // Name might change
    if (whyUsTableContainer) whyUsTableContainer.style.display = 'none'; // Name might change
    if (settingsContainer) settingsContainer.style.display = 'none';
    if (sectionsContainer) sectionsContainer.style.display = 'none';

    // Reset Header Actions (Default Hidden)
    if (filterRow) filterRow.style.display = 'none';
    if (addBtn) addBtn.style.display = 'none';
    if (saveOrderBtn) saveOrderBtn.style.display = 'none';
    const csvBtn = document.getElementById('csvBtn');
    if (csvBtn) csvBtn.style.display = 'none';
    const bulkImagesBtn = document.getElementById('bulkImagesBtn');
    if (bulkImagesBtn) bulkImagesBtn.style.display = 'none';

    // Reset buttons active state
    [viewProductsBtn, viewTestimonialsBtn, viewCategoriesBtn, viewWhyUsBtn, viewSectionsBtn, viewSettingsBtn].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    const activeStyle = (btn) => {
        if (btn) btn.classList.add('active');
    }

    if (view === 'products') {
        if (productList) productList.style.display = 'grid';
        activeStyle(viewProductsBtn);

        // Show Actions
        if (filterRow) filterRow.style.display = 'flex';
        if (addBtn) {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = 'Add Product';
        }
        if (csvBtn) csvBtn.style.display = 'inline-flex'; // Show CSV button
        if (bulkImagesBtn) bulkImagesBtn.style.display = 'inline-flex'; // Show Bulk Images button

        populateCategoryFilter();
        fetchProducts();

    } else if (view === 'testimonials') {
        // Will update ID in next steps, assuming old ID for now or using variable
        if (testimonialsTableContainer) testimonialsTableContainer.style.display = 'block';
        activeStyle(viewTestimonialsBtn);

        if (addBtn) {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = 'Add Testimonial';
        }
        if (csvBtn) csvBtn.style.display = 'inline-flex'; // Show CSV button
        fetchTestimonials();

    } else if (view === 'categories') {
        if (categoriesTableContainer) categoriesTableContainer.style.display = 'block';
        activeStyle(viewCategoriesBtn);

        if (addBtn) {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = 'Add Category';
        }
        if (csvBtn) csvBtn.style.display = 'inline-flex'; // Show CSV button
        fetchCategories();

    } else if (view === 'why-us') {
        if (whyUsTableContainer) whyUsTableContainer.style.display = 'block';
        activeStyle(viewWhyUsBtn);

        if (addBtn) {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = 'Add Feature';
        }
        fetchWhyUsFeatures();

    } else if (view === 'sections') {
        if (sectionsContainer) sectionsContainer.style.display = 'block';
        activeStyle(viewSectionsBtn);
        fetchSectionSettings();

    } else if (view === 'settings') {
        settingsContainer.style.display = 'block';
        activeStyle(viewSettingsBtn);
        fetchSettings();
    }

    // Update mobile bottom nav active state
    const mobileNav = document.getElementById('mobile-bottom-nav');
    if (mobileNav) {
        mobileNav.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
};

window.handleAddClick = () => {
    if (currentView === 'products') openProductModal();
    else if (currentView === 'testimonials') openTestimonialModal();
    else if (currentView === 'categories') openCategoryModal();
    else if (currentView === 'why-us') showWhyUsModal();
}

// ----------------------------------------------------
// CATEGORIES MANAGEMENT
// ----------------------------------------------------

async function fetchCategories() {
    categoryList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading...</td></tr>';
    try {
        const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (error) throw error;
        renderCategoryList(data);
    } catch (e) {
        console.error(e);
        categoryList.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Error: ${e.message}</td></tr>`;
    }
}

function renderCategoryList(categories) {
    if (!categories || categories.length === 0) {
        categoryList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;">No categories found.</div>';
        return;
    }

    categoryList.innerHTML = categories.map(cat => `
        <div class="admin-product-card draggable-item" 
             draggable="true" 
             data-id="${cat.id}" 
             data-type="category"
             data-order="${cat.display_order || 0}"
             style="cursor: move;"
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragenter="handleDragEnter(event)"
             ondragleave="handleDragLeave(event)">

             <div class="card-row" onclick="toggleCardDetails('${cat.id}')" style="grid-template-columns: 80px 1fr 60px 100px 30px;">
                  <!-- Grip -->
                  <div style="position: absolute; left: 5px; color: #ccc;"><i class="fas fa-grip-vertical"></i></div>
                  
                  <img src="${cat.image_url || PLACEHOLDER_IMAGE}" 
                       onerror="this.src=PLACEHOLDER_IMAGE"
                       style="margin-left: 15px;">

                  <div class="row-info">
                       <h3 ${!cat.is_visible ? 'style="opacity: 0.5;"' : ''}>
                           ${cat.title} 
                           ${!cat.is_visible ? '<i class="fas fa-eye-slash" title="Hidden" style="color: #64748b; margin-left: 5px;"></i>' : ''}
                       </h3>
                       <div class="tagline">/${cat.slug}</div>
                       ${cat.sub_brand ? `<span class="category-badge">${cat.sub_brand}</span>` : ''}
                  </div>

                  <div class="display-order-cell" style="text-align: center; font-weight: bold; color: var(--text-secondary);">
                       ${cat.display_order}
                  </div>

                  <div class="row-actions" onclick="event.stopPropagation()">
                      <button onclick="editCategory('${cat.id}')" class="admin-btn btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="deleteCategory('${cat.id}')" class="admin-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>

                  <i class="fas fa-chevron-down" id="chevron-${cat.id}" style="color: var(--text-secondary); transition: transform 0.2s;"></i>
             </div>

             <div class="card-expanded-details" id="details-${cat.id}">
                 <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                     <div>
                         <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Description</h4>
                         <p style="margin: 0; color: var(--text-secondary);">${cat.description || 'No description found.'}</p>
                     </div>
                 </div>
             </div>
        </div>
    `).join('');
}

window.openCategoryModal = (id = null) => {
    categoryModal.style.display = 'flex';
    categoryForm.reset();
    document.getElementById('catId').value = '';
    if (id) {
        catModalTitle.textContent = 'Edit Category';
        loadCategoryData(id);
    } else {
        editSnapshot = null; // New
        catModalTitle.textContent = 'Add Category';
        document.getElementById('catVisible').checked = true; // Default visible
    }
}
window.closeCategoryModal = () => { categoryModal.style.display = 'none'; }

async function loadCategoryData(id) {
    const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
    if (cat) {
        editSnapshot = JSON.parse(JSON.stringify(cat)); // Snapshot
        document.getElementById('catId').value = cat.id;
        document.getElementById('catTitle').value = cat.title;
        document.getElementById('catSubBrand').value = cat.sub_brand || '';
        document.getElementById('catSubBrandLogo').value = cat.sub_brand_logo_url || '';
        document.getElementById('catSlug').value = cat.slug;
        document.getElementById('catTelugu').value = cat.telugu_title || '';
        document.getElementById('catShortDesc').value = cat.short_description || '';
        document.getElementById('catDescription').value = cat.description || '';
        document.getElementById('catOrder').value = cat.display_order || 0;
        document.getElementById('catOrder').value = cat.display_order || 0;
        document.getElementById('catImageUrl').value = cat.image_url || '';
        document.getElementById('catVisible').checked = cat.is_visible !== false; // Default true if null
    }
}

// Category Filter Logic
const categoryFilter = document.getElementById('categoryFilter');
const trendingFilter = document.getElementById('trendingFilter');

// New Smart Filter Logic
window.toggleFilterDropdown = () => {
    const dropdown = document.getElementById('filterDropdown');
    const trigger = document.getElementById('filterTrigger');
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        trigger.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        trigger.classList.add('active');
    }
}

window.selectCategory = (slug, title) => {
    // Update Hidden Input
    document.getElementById('categoryFilter').value = slug;

    // Update Label
    document.getElementById('filterLabel').textContent = title;

    // Update UI State
    const allOptions = document.querySelectorAll('.filter-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));

    const selectedOpt = document.querySelector(`.filter-option[data-value="${slug}"]`);
    if (selectedOpt) selectedOpt.classList.add('selected');

    // Close Dropdown
    toggleFilterDropdown();

    // Trigger Render
    renderProductList();
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const container = document.querySelector('.custom-filter-container');
    if (container && !container.contains(e.target)) {
        document.getElementById('filterDropdown').classList.remove('show');
        document.getElementById('filterTrigger').classList.remove('active');
    }
});

if (trendingFilter) {
    trendingFilter.addEventListener('change', () => renderProductList());
}

async function populateCategoryFilter() {
    // console.log('Populating Smart Filter...');
    const dropdown = document.getElementById('filterDropdown');
    if (!dropdown) {
        console.error('CRITICAL: filterDropdown element NOT found in DOM');
        return;
    }

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        // Store globally for sorting products by category order
        allCategories = categories || [];

        let html = `
            <div class="filter-option selected" data-value="all" onclick="selectCategory('all', 'All Categories')">
                <span>All Categories</span>
                <i class="fas fa-check check-icon"></i>
            </div>
        `;

        if (categories) {
            categories.forEach(cat => {
                html += `
                    <div class="filter-option" data-value="${cat.slug}" onclick="selectCategory('${cat.slug}', '${cat.title}')">
                        <span>${cat.title}</span>
                        <i class="fas fa-check check-icon"></i>
                    </div>
                `;
            });
        }

        dropdown.innerHTML = html;

    } catch (e) {
        console.error('Error populating filter:', e);
        dropdown.innerHTML = '<div style="padding:10px; color:red;">Error loading</div>';
    }
}
// Ensure Categories logic is hooked up
if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('catId').value;
        const btn = categoryForm.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const formData = {
            title: document.getElementById('catTitle').value,
            sub_brand: document.getElementById('catSubBrand').value,
            sub_brand_logo_url: document.getElementById('catSubBrandLogo').value,
            slug: document.getElementById('catSlug').value,
            telugu_title: document.getElementById('catTelugu').value,
            short_description: document.getElementById('catShortDesc').value,
            description: document.getElementById('catDescription').value,
            display_order: parseInt(document.getElementById('catOrder').value || 0),
            display_order: parseInt(document.getElementById('catOrder').value || 0),
            image_url: document.getElementById('catImageUrl').value,
            is_visible: document.getElementById('catVisible').checked
        };

        try {
            const { error } = id
                ? await supabase.from('categories').update(formData).eq('id', id)
                : await supabase.from('categories').insert([formData]);

            if (error) throw error;
            closeCategoryModal();
            fetchCategories();

            let toastMsg = 'Category saved.';
            if (id) {
                const changes = getChanges(editSnapshot, formData);
                toastMsg = `Updated: ${changes.join(', ')}`;
            } else {
                toastMsg = 'Created New Category';
            }
            showToast(toastMsg, 'success');
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally {
            btn.textContent = oldText;
            btn.disabled = false;
        }
    });
}

window.editCategory = (id) => openCategoryModal(id);
window.deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        fetchCategories();
    } catch (e) { alert('Error: ' + e.message); }
}

// ----------------------------------------------------
// SITE SETTINGS MANAGEMENT
// ----------------------------------------------------

async function fetchSettings() {
    try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows found

        if (data) {
            editSnapshot = JSON.parse(JSON.stringify(data)); // Snapshot
            document.getElementById('setSiteTitle').value = data.site_title || '';
            document.getElementById('setSiteTitleTelugu').value = data.site_title_telugu || '';
            document.getElementById('setHeroTitle').value = data.hero_title || '';
            document.getElementById('setHeroSubtitle').value = data.hero_subtitle || '';
            document.getElementById('setHeroDesc').value = data.hero_description || '';
            document.getElementById('setHeroTelugu').value = data.hero_telugu_subtitle || '';
            document.getElementById('setPhonePri').value = data.contact_phone_primary || '';
            document.getElementById('setPhoneSec').value = data.contact_phone_secondary || '';
            document.getElementById('setEmail').value = data.contact_email || '';
            document.getElementById('setMapUrl').value = data.map_embed_url || '';
            document.getElementById('setFssai').value = data.fssai_number || '';
            document.getElementById('setLogoUrl').value = data.logo_url || '';
            document.getElementById('setFaviconUrl').value = data.fav_icon_url || '';
            document.getElementById('setHeroBgUrl').value = data.hero_background_url || '';
            document.getElementById('setProductPlaceholder').value = data.product_placeholder_url || '';

            // Social Media
            document.getElementById('setFacebookUrl').value = data.facebook_url || '';
            document.getElementById('setInstagramUrl').value = data.instagram_url || '';
            document.getElementById('setWhatsappUrl').value = data.whatsapp_url || '';
            document.getElementById('setYoutubeUrl').value = data.youtube_url || '';

            // Legal Documents
            document.getElementById('setPrivacyPolicy').value = data.privacy_policy || '';
            document.getElementById('setCookiePolicy').value = data.cookie_policy || '';
            document.getElementById('setTermsConditions').value = data.terms_conditions || '';

            // Catalogue & Address Settings
            document.getElementById('setCatalogueUrl').value = data.catalogue_image_url || '';
            document.getElementById('setCatalogueMsg').value = data.catalogue_share_message || 'Check out our latest catalogue of delicious treats!';
            document.getElementById('setAddress').value = data.company_address || '';

            // QC Settings
            document.getElementById('setQuickHeroTitle').value = data.quick_hero_title || '';
            document.getElementById('setQuickHeroSubtitle').value = data.quick_hero_subtitle || '';
            document.getElementById('setQuickHeroTelugu').value = data.quick_hero_telugu_subtitle || '';
            document.getElementById('setQuickHeroBg').value = data.quick_hero_image_url || '';
            document.getElementById('setShowMrp').checked = data.show_mrp !== false; // Default true
            document.getElementById('setSalesMode').checked = data.sales_mode_enabled || false; // Default false

            // Sales Page Settings
            document.getElementById('setAllProductsTagline').value = data.all_products_tagline || 'Featuring our premium brands';
        }
    } catch (e) {
        console.error('Settings fetch error:', e);
    }
}

// Cancel settings changes - revert to original values
window.cancelSettingsChanges = function () {
    if (!editSnapshot) {
        showToast('No changes to cancel', 'info');
        return;
    }

    const data = editSnapshot;

    // Reset all fields to snapshot values
    document.getElementById('setSiteTitle').value = data.site_title || '';
    document.getElementById('setSiteTitleTelugu').value = data.site_title_telugu || '';
    document.getElementById('setHeroTitle').value = data.hero_title || '';
    document.getElementById('setHeroSubtitle').value = data.hero_subtitle || '';
    document.getElementById('setHeroDesc').value = data.hero_description || '';
    document.getElementById('setHeroTelugu').value = data.hero_telugu_subtitle || '';
    document.getElementById('setPhonePri').value = data.contact_phone_primary || '';
    document.getElementById('setPhoneSec').value = data.contact_phone_secondary || '';
    document.getElementById('setEmail').value = data.contact_email || '';
    document.getElementById('setMapUrl').value = data.map_embed_url || '';
    document.getElementById('setFssai').value = data.fssai_number || '';
    document.getElementById('setLogoUrl').value = data.logo_url || '';
    document.getElementById('setFaviconUrl').value = data.fav_icon_url || '';
    document.getElementById('setHeroBgUrl').value = data.hero_background_url || '';
    document.getElementById('setProductPlaceholder').value = data.product_placeholder_url || '';

    // Social Media
    document.getElementById('setFacebookUrl').value = data.facebook_url || '';
    document.getElementById('setInstagramUrl').value = data.instagram_url || '';
    document.getElementById('setWhatsappUrl').value = data.whatsapp_url || '';
    document.getElementById('setYoutubeUrl').value = data.youtube_url || '';

    // Legal Documents
    document.getElementById('setPrivacyPolicy').value = data.privacy_policy || '';
    document.getElementById('setCookiePolicy').value = data.cookie_policy || '';
    document.getElementById('setTermsConditions').value = data.terms_conditions || '';

    // Catalogue & Address
    document.getElementById('setCatalogueUrl').value = data.catalogue_image_url || '';
    document.getElementById('setCatalogueMsg').value = data.catalogue_share_message || 'Check out our latest catalogue of delicious treats!';
    document.getElementById('setAddress').value = data.company_address || '';

    // QC Settings
    document.getElementById('setQuickHeroTitle').value = data.quick_hero_title || '';
    document.getElementById('setQuickHeroSubtitle').value = data.quick_hero_subtitle || '';
    document.getElementById('setQuickHeroTelugu').value = data.quick_hero_telugu_subtitle || '';
    document.getElementById('setQuickHeroBg').value = data.quick_hero_image_url || '';
    document.getElementById('setShowMrp').checked = data.show_mrp !== false;
    document.getElementById('setSalesMode').checked = data.sales_mode_enabled || false;

    // Sales Page Settings
    document.getElementById('setAllProductsTagline').value = data.all_products_tagline || 'Featuring our premium brands';

    showToast('Settings changes cancelled', 'info');
};

if (siteSettingsForm) {
    siteSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = siteSettingsForm.querySelector('.fab-save');
        const oldHtml = btn ? btn.innerHTML : '<i class="fas fa-save"></i><span>Save</span>';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
            btn.disabled = true;
        }

        const settingsData = {
            site_title: document.getElementById('setSiteTitle').value,
            site_title_telugu: document.getElementById('setSiteTitleTelugu').value,
            hero_title: document.getElementById('setHeroTitle').value,
            hero_subtitle: document.getElementById('setHeroSubtitle').value,
            hero_description: document.getElementById('setHeroDesc').value,
            hero_telugu_subtitle: document.getElementById('setHeroTelugu').value,
            contact_phone_primary: document.getElementById('setPhonePri').value,
            contact_phone_secondary: document.getElementById('setPhoneSec').value,
            contact_email: document.getElementById('setEmail').value,
            map_embed_url: document.getElementById('setMapUrl').value,
            fssai_number: document.getElementById('setFssai').value,
            logo_url: document.getElementById('setLogoUrl').value,
            fav_icon_url: document.getElementById('setFaviconUrl').value,
            hero_background_url: document.getElementById('setHeroBgUrl').value,
            product_placeholder_url: document.getElementById('setProductPlaceholder').value,

            // Social Media
            facebook_url: document.getElementById('setFacebookUrl').value,
            instagram_url: document.getElementById('setInstagramUrl').value,
            whatsapp_url: document.getElementById('setWhatsappUrl').value,
            youtube_url: document.getElementById('setYoutubeUrl').value,

            // Catalogue & Address
            catalogue_image_url: document.getElementById('setCatalogueUrl').value,
            catalogue_share_message: document.getElementById('setCatalogueMsg').value,
            company_address: document.getElementById('setAddress').value,

            // QC Fields
            quick_hero_title: document.getElementById('setQuickHeroTitle').value,
            quick_hero_subtitle: document.getElementById('setQuickHeroSubtitle').value,
            quick_hero_telugu_subtitle: document.getElementById('setQuickHeroTelugu').value,
            quick_hero_image_url: document.getElementById('setQuickHeroBg').value,

            show_mrp: document.getElementById('setShowMrp').checked,
            sales_mode_enabled: document.getElementById('setSalesMode').checked,

            // Sales Page Settings
            all_products_tagline: document.getElementById('setAllProductsTagline').value
        };

        try {
            // Check if settings exist, if so update, else insert (though migration seeds it)
            const { data } = await supabase.from('site_settings').select('id').single();

            if (data) {
                const { error } = await supabase.from('site_settings').update(settingsData).eq('id', data.id);
                if (error) throw error;

                // Get changed field keys
                const changedKeys = [];
                if (editSnapshot) {
                    for (const key in settingsData) {
                        if (!isLooseEqual(editSnapshot[key], settingsData[key])) {
                            changedKeys.push(key);
                        }
                    }
                }

                // Highlight the changed form inputs
                const fieldIdMap = {
                    'site_title': 'setSiteTitle',
                    'site_title_telugu': 'setSiteTitleTelugu',
                    'hero_title': 'setHeroTitle',
                    'hero_subtitle': 'setHeroSubtitle',
                    'hero_description': 'setHeroDesc',
                    'hero_telugu_subtitle': 'setHeroTelugu',
                    'contact_phone_primary': 'setPhonePri',
                    'contact_phone_secondary': 'setPhoneSec',
                    'contact_email': 'setEmail',
                    'map_embed_url': 'setMapUrl',
                    'fssai_number': 'setFssai',
                    'logo_url': 'setLogoUrl',
                    'fav_icon_url': 'setFaviconUrl',
                    'hero_background_url': 'setHeroBgUrl',
                    'product_placeholder_url': 'setProductPlaceholder',
                    'catalogue_image_url': 'setCatalogueUrl',
                    'catalogue_share_message': 'setCatalogueMsg',
                    'company_address': 'setAddress',
                    'quick_hero_title': 'setQuickHeroTitle',
                    'quick_hero_subtitle': 'setQuickHeroSubtitle',
                    'quick_hero_telugu_subtitle': 'setQuickHeroTelugu',
                    'quick_hero_image_url': 'setQuickHeroBg',
                    'show_mrp': 'setShowMrp',
                    'sales_mode_enabled': 'setSalesMode',
                    'all_products_tagline': 'setAllProductsTagline'
                };

                changedKeys.forEach(key => {
                    const inputId = fieldIdMap[key];
                    if (inputId) {
                        const el = document.getElementById(inputId);
                        if (el) {
                            el.classList.add('field-updated');
                            setTimeout(() => el.classList.remove('field-updated'), 1500);
                        }
                    }
                });

                // Show toast
                if (changedKeys.length > 0) {
                    const labels = changedKeys.map(k =>
                        k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    );
                    showToast(`Updated: ${labels.join(', ')}`, 'success');
                } else {
                    showToast('Data already matches your input', 'info');
                }
            } else {
                const { error } = await supabase.from('site_settings').insert([settingsData]);
                if (error) throw error;
                showToast('Settings initialized!', 'success');
            }
            editSnapshot = JSON.parse(JSON.stringify(settingsData)); // Update snapshot
        } catch (e) {
            showToast('Error: ' + e.message, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = oldHtml;
                btn.disabled = false;
            }
        }
    });
}

// ----------------------------------------------------
// ASSET UPLOAD HANDLING (Combined for all inputs)
// ----------------------------------------------------

window.handleAssetUpload = async (inputElement, targetUrlInputId) => {
    const file = inputElement.files[0];
    if (!file) return;

    const urlInput = document.getElementById(targetUrlInputId);

    // Toast for Start
    showToast('Uploading image...', 'info');

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Decide bucket based on usage? Actually 'site-assets' is good for all admin general assets
        // Product images use 'product-images', others use 'site-assets'
        const bucket = 'site-assets';

        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

        urlInput.value = publicUrl;

        // Trigger generic change event to update previews if any listener attached (optional)
        urlInput.dispatchEvent(new Event('change'));

        showToast('Image uploaded successfully!', 'success');

    } catch (e) {
        console.error(e);
        showToast('Upload failed: ' + e.message, 'error');
    }
};

// Helper: Populate Product Categories dynamically in Product Modal
async function populateCategoryOptions() {
    try {
        const { data } = await supabase.from('categories').select('title, slug').order('display_order');
        if (data && productCategorySelect) {
            productCategorySelect.innerHTML = data.map(c => `<option value="${c.slug}">${c.title}</option>`).join('');
        }
    } catch (e) { console.error('Error loading cats for dropdown', e); }
}

// Override openProductModal to fetch cats every time (or cache it)


// ... [Existing Product Management Functions: fetchProducts, renderProductList] ...

// Global Products State
// Using existing global variable allProducts defined at top

async function fetchProducts() {
    productList.innerHTML = '<p style="text-align: center;">Loading...</p>';

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('product_category', { ascending: true })
            .order('display_order', { ascending: true });

        if (error) throw error;

        allProducts = products; // Store globally

        // Fetch all product images to show in the list
        const { data: images, error: imgError } = await supabase
            .from('product_images')
            .select('product_id, image_url, is_default')
            .order('display_order', { ascending: true });

        if (!imgError) {
            window.allProductImagesCache = images || [];
        }

        await populateCategoryFilter(); // WAIT for categories to ensure dropdown is ready
        renderProductList(); // Render based on current filter state
    } catch (error) {
        console.error('Fetch error:', error);
        productList.innerHTML = `<p style="color: red; text-align: center;">Error: ${error.message}</p>`;
    }
}

function renderProductList() { // No arg needed, uses global allProducts + filter
    let displayProducts = [...allProducts]; // Clone to avoid mutating original

    // Apply Filter
    const categoryFilter = document.getElementById('categoryFilter');
    const trendingFilter = document.getElementById('trendingFilter');

    const isCatFiltered = categoryFilter && categoryFilter.value !== 'all';
    const isTrendingFiltered = trendingFilter && trendingFilter.checked;

    // Drag-and-drop is ONLY enabled when filtering by a specific category (not trending, not all)
    const isDragEnabled = isCatFiltered && !isTrendingFiltered;

    if (isCatFiltered) {
        displayProducts = displayProducts.filter(p => p.product_category === categoryFilter.value);
    }

    if (isTrendingFiltered) {
        displayProducts = displayProducts.filter(p => p.is_trending);
    }

    if (!displayProducts || displayProducts.length === 0) {
        productList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;">No products found.</div>';
        return;
    }

    // Sort logic:
    // - If category filtered: sort by display_order within that category
    // - If "All" or trending: sort by category order first, then display_order within category
    if (isCatFiltered && !isTrendingFiltered) {
        // Single category: just sort by display_order
        displayProducts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } else {
        // All categories or trending: sort by category order first, then product display_order
        // Build a category order map from allCategories
        const categoryOrderMap = {};
        allCategories.forEach((cat, index) => {
            categoryOrderMap[cat.slug] = cat.display_order || index;
        });

        displayProducts.sort((a, b) => {
            const catOrderA = categoryOrderMap[a.product_category] ?? 999;
            const catOrderB = categoryOrderMap[b.product_category] ?? 999;
            if (catOrderA !== catOrderB) {
                return catOrderA - catOrderB;
            }
            // Same category: sort by display_order
            return (a.display_order || 0) - (b.display_order || 0);
        });
    }

    const saveOrderBtn = document.getElementById('saveOrderBtn');
    if (saveOrderBtn) {
        // Only show save button when drag is enabled (category filtered, not trending)
        saveOrderBtn.style.display = isDragEnabled ? 'inline-block' : 'none';
    }

    // Drag hint - show when not in a draggable state
    let dndHint = '';
    if (!isDragEnabled) {
        if (isTrendingFiltered) {
            dndHint = '<div style="grid-column: 1/-1; text-align: center; background: #e0f2fe; color: #0369a1; padding: 8px; font-size: 0.9rem; border-radius: 8px; margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Trending products are sorted by category order. Select a specific category to reorder.</div>';
        } else if (!isCatFiltered) {
            dndHint = '<div style="grid-column: 1/-1; text-align: center; background: #fff3cd; color: #856404; padding: 8px; font-size: 0.9rem; border-radius: 8px; margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Products are grouped by category order. Select a specific category to enable reordering.</div>';
        }
    }

    productList.innerHTML = dndHint + displayProducts.map((product, index) => {
        // Variants Grid
        const variants = typeof product.quantity_variants === 'string' ? JSON.parse(product.quantity_variants) : (product.quantity_variants || []);

        // Ensure at least 3 slots for grid consistency if we want fixed columns, 
        // OR just render what we have. Design plan said "rows for variants" or "up to 3". 
        // Let's render up to 3 columns if available, or just empty slots?
        // The CSS grid is repeat(3, 1fr). So we should fill 3 slots to maintain layout structure or just let them auto-flow?
        // Let's stick to filling 3 slots for alignment if possible, or just rendering valid ones.
        // Actually best to just render available ones.

        let variantsHtml = '';
        if (variants.length > 0) {
            variantsHtml = variants.slice(0, 3).map(v => `
                <div class="mini-variant">
                    <div class="v-qty">${v.quantity}</div>
                    <div class="v-price">₹${v.price}</div>
                    ${(v.global_sold || v.total_sold) ? `<div class="v-sold" title="Lifetime Global Sales"><i class="fas fa-shopping-bag"></i> ${v.global_sold || v.total_sold}</div>` : ''}
                </div>
            `).join('');

            // Fill empty slots if less than 3 so grid stays aligned
            for (let i = variants.length; i < 3; i++) {
                variantsHtml += `<div class="mini-variant" style="opacity: 0.3;">-</div>`;
            }
        } else {
            variantsHtml = `<div style="grid-column: 1/span 3; text-align: center; color: var(--text-secondary); font-size: 0.8rem;">No variants</div>`;
        }

        // Find default image from cache if available
        const productImages = (window.allProductImagesCache || []).filter(img => img.product_id === product.id);
        const defaultImg = productImages.find(img => img.is_default)?.image_url || productImages[0]?.image_url || product.showcase_image || PLACEHOLDER_IMAGE;

        return `
        <div class="admin-product-card draggable-item" 
             draggable="${isDragEnabled}" 
             data-id="${product.id}"
             data-order="${product.display_order || 0}"
             ${isDragEnabled ? `
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragenter="handleDragEnter(event)"
             ondragleave="handleDragLeave(event)"` : ''}>
            
            <div class="card-row" onclick="toggleCardDetails('${product.id}')">
                <!-- Grip for Drag -->
                ${isDragEnabled ? '<div style="position: absolute; left: 5px; color: #ccc;"><i class="fas fa-grip-vertical"></i></div>' : ''}
                
                <img src="${defaultImg}" 
                     onerror="this.src=PLACEHOLDER_IMAGE"
                     style="${isDragEnabled ? 'margin-left: 15px;' : ''}">
                
                <div class="row-info">
                    <h3 ${!product.is_visible ? 'style="opacity: 0.5;"' : ''}>
                        ${product.product_name}
                        ${product.is_trending ? '<i class="fas fa-fire" title="Trending Item" style="color: #f59e0b; margin-left: 5px;"></i>' : ''}
                        ${product.is_visible === false ? '<i class="fas fa-eye-slash" title="Hidden on Site" style="color: #64748b; margin-left: 5px;"></i>' : ''}
                    </h3>
                    <div class="tagline">${product.product_tagline || ''}</div>
                    <span class="category-badge">${product.product_category.replace(/-/g, ' ')}</span>
                </div>

                <div class="row-variants">
                    ${variantsHtml}
                </div>

                <div class="display-order-cell" style="text-align: center; font-weight: bold; color: var(--text-secondary);">
                    ${product.display_order || 0}
                </div>

                <div class="row-actions" onclick="event.stopPropagation()">
                    <button onclick="editProduct('${product.id}')" class="admin-btn btn-sm" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="admin-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <i class="fas fa-chevron-down" id="chevron-${product.id}" style="color: var(--text-secondary); transition: transform 0.2s;"></i>
            </div>

            <div class="card-expanded-details" id="details-${product.id}">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Description</h4>
                        <p style="margin: 0 0 10px; color: var(--text-secondary);">${product.product_description || 'None'}</p>
                        
                        <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Ingredients</h4>
                        <p style="margin: 0; color: var(--text-secondary);">${product.ingredients || 'None'}</p>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Usage Instructions</h4>
                        <p style="margin: 0 0 10px; color: var(--text-secondary);">${product.serving_suggestion || 'None'}</p>

                        <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Nutrition Info</h4>
                        <p style="margin: 0; color: var(--text-secondary);">${product.nutrition_info ? 'Available (Check Edit Mode)' : 'None'}</p>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

// Expose renderProductList globally for onclick handlers
window.renderProductList = renderProductList;

window.toggleCardDetails = function (id) {
    const details = document.getElementById(`details-${id}`);
    const chevron = document.getElementById(`chevron-${id}`);

    if (details.classList.contains('open')) {
        details.classList.remove('open');
        chevron.style.transform = 'rotate(0deg)';
    } else {
        details.classList.add('open');
        chevron.style.transform = 'rotate(180deg)';
    }
};
let dragSrcEl = null;

// Drag and Drop Handlers
// Drag and Drop Handlers
window.handleDragStart = (e) => {
    dragSrcEl = e.target.closest('.draggable-item, .draggable-row');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', dragSrcEl.innerHTML);
    dragSrcEl.classList.add('dragging');
    dragSrcEl.style.opacity = '0.4';
};

window.handleDragOver = (e) => {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.draggable-item, .draggable-row');
    if (target && target !== dragSrcEl) {
        target.classList.add('over');
    }
    return false;
};

window.handleDragEnter = (e) => {
    // e.currentTarget.style.background = '#f0f9ff'; 
    // Optional visual feed back usually handled by CSS 'over' class
};

window.handleDragLeave = (e) => {
    const target = e.target.closest('.draggable-item, .draggable-row');
    if (target) {
        target.classList.remove('over');
    }
};


window.handleDrop = (e) => {
    e.stopPropagation();

    const dragSrcEl = document.querySelector('.draggable-item.dragging, .draggable-row.dragging');
    const dropTarget = e.target.closest('.draggable-item, .draggable-row');

    if (dragSrcEl && dropTarget && dragSrcEl !== dropTarget) {
        const container = dragSrcEl.parentNode;
        const allItems = Array.from(container.children).filter(el => el.classList.contains('draggable-item') || el.classList.contains('draggable-row'));
        const srcIndex = allItems.indexOf(dragSrcEl);
        const targetIndex = allItems.indexOf(dropTarget);

        if (srcIndex < targetIndex) {
            container.insertBefore(dragSrcEl, dropTarget.nextSibling);
        } else {
            container.insertBefore(dragSrcEl, dropTarget);
        }

        // Re-calculate orders visually
        const type = dragSrcEl.dataset.type;
        updateVisualOrder(type, container);

        const saveOrderBtn = document.getElementById('saveOrderBtn');
        if (saveOrderBtn) saveOrderBtn.style.display = 'inline-block';
    }

    // Cleanup
    const cols = document.querySelectorAll('.draggable-item, .draggable-row');
    cols.forEach(col => {
        col.classList.remove('over');
        col.classList.remove('dragging');
        col.style.opacity = '1';
    });

    return false;
};

// Generic Visual Order Update for Cards
function updateVisualOrder(type, container) {
    if (!container) return;
    const items = Array.from(container.children).filter(el => el.classList.contains('draggable-item') || el.classList.contains('draggable-row'));

    items.forEach((item, index) => {
        const newOrder = index + 1;

        // Generic approach: Find .display-order-cell
        // Works for Products, Categories, Testimonials, Why Us (if we add the class)
        const displayCell = item.querySelector('.display-order-cell');
        if (displayCell) {
            // Check if it has specific text formatting needs (like "Order: X")
            // Simplest: Replace the number part if possible, or just replace text content content if it was just number.
            // But my new cards have "Order: X".
            // Regex replace or textContent?
            if (displayCell.textContent.includes('Order:')) {
                displayCell.textContent = `Order: ${newOrder}`;
            } else {
                displayCell.textContent = newOrder;
            }
        }

        // Legacy table support (if any left, though we refactored all)
        if (item.tagName === 'TR') {
            const cells = item.querySelectorAll('td');
            // Assume order is in 4th column (index 3) for table based views
            if (cells[3]) cells[3].textContent = newOrder;
        } else {
            item.setAttribute('data-order', newOrder);
        }
    });
}

// Global Save Function for Reordering
window.saveCurrentOrder = async (overrideType = null) => {
    let container, type, tableName, orderField = 'display_order';

    // Determine context based on currentView or overrideType
    const view = overrideType || currentView;

    if (view === 'products' || view === 'product') {
        container = document.getElementById('productListContainer');
        type = 'product';
        tableName = 'products';
    } else if (view === 'categories' || view === 'category') {
        container = document.getElementById('categoryList');
        type = 'category';
        tableName = 'categories';
    } else if (view === 'testimonials' || view === 'testimonial') {
        container = document.getElementById('testimonialList');
        type = 'testimonial';
        tableName = 'testimonials';
    } else if (view === 'why-us') {
        container = document.getElementById('whyUsFeatureList');
        type = 'why-us';
        tableName = 'why_us_features';
        orderField = 'order_index';
    } else {
        console.error('Unknown view for saving order:', view);
        return;
    }

    const btn = document.getElementById('saveOrderBtn');
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;
    }

    try {
        const items = Array.from(container.children).filter(el =>
            el.classList.contains('draggable-item') || el.classList.contains('draggable-row')
        );

        const updates = items.map((item, index) => ({
            id: item.getAttribute('data-id'),
            display_order: index + 1
        }));

        // Batch update in Supabase
        for (const update of updates) {
            const updatePayload = {};
            updatePayload[orderField] = update.display_order;

            const { error } = await supabase
                .from(tableName)
                .update(updatePayload)
                .eq('id', update.id);
            if (error) throw error;
        }

        showToast('Updated Display Order', 'success');
        if (btn) btn.style.display = 'none';

        // Refresh Data
        if (view === 'categories' || view === 'category') fetchCategories();
        else if (view === 'testimonials' || view === 'testimonial') fetchTestimonials();
        else if (view === 'why-us') fetchWhyUsFeatures();
        else if (view === 'products' || view === 'product') fetchProducts();

    } catch (e) {
        console.error('Error saving order:', e);
        showToast('Failed to save order: ' + e.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }
    }
};

// Map the HTML onclick handler name to our unified function
window.saveNewOrder = window.saveCurrentOrder;

async function updateOrderFromDom(type, container) {
    // This is now redundant but kept for legacy calls if any
    await window.saveCurrentOrder(type);
}

// Testimonial Management
async function fetchTestimonials() {
    testimonialList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading...</td></tr>';

    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        renderTestimonialList(testimonials);
    } catch (error) {
        console.error('Fetch error:', error);
        testimonialList.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Error: ${error.message}</td></tr>`;
    }
}

function renderTestimonialList(testimonials) {
    if (!testimonials || testimonials.length === 0) {
        testimonialList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;">No testimonials found.</div>';
        return;
    }

    testimonialList.innerHTML = testimonials.map(t => `
        <div class="admin-product-card draggable-item" 
             draggable="true" 
             data-id="${t.id}" 
             data-type="testimonial"
             data-order="${t.display_order || 0}"
             style="cursor: move;"
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragenter="handleDragEnter(event)"
             ondragleave="handleDragLeave(event)">

             <div class="card-row" onclick="toggleCardDetails('${t.id}')" style="grid-template-columns: 80px 1fr 60px 100px 30px;">
                  <!-- Grip -->
                  <div style="position: absolute; left: 5px; color: #ccc;"><i class="fas fa-grip-vertical"></i></div>

                  <!-- Avatar -->
                  <div style="margin-left: 15px; width: 60px; height: 60px; background: var(--bg-secondary); border-radius: 8px; display: flex; justify-content: center; align-items: center; font-weight: bold; color: var(--color-primary-blue); border: 1px solid var(--border-light); font-size: 1.5rem;">
                        ${t.name.charAt(0).toUpperCase()}
                  </div>

                  <div class="row-info">
                       <h3>${t.name} <span style="font-size: 0.8rem; color: #f59e0b; margin-left: 8px;">${'★'.repeat(t.rating)}</span></h3>
                       <div class="tagline">${t.location || 'No Location'}</div>
                       <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">"${t.message}"</div>
                  </div>

                  <div class="display-order-cell" style="text-align: center; font-weight: bold; color: var(--text-secondary);">
                       ${t.display_order}
                  </div>

                  <div class="row-actions" onclick="event.stopPropagation()">
                      <button onclick="editTestimonial('${t.id}')" class="admin-btn btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="deleteTestimonial('${t.id}')" class="admin-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>

                  <i class="fas fa-chevron-down" id="chevron-${t.id}" style="color: var(--text-secondary); transition: transform 0.2s;"></i>
             </div>

             <div class="card-expanded-details" id="details-${t.id}">
                 <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Full Review</h4>
                 <p style="margin: 0; color: var(--text-secondary); font-style: italic;">"${t.message}"</p>
                 ${t.product_name ? `<p style="margin: 10px 0 0; font-size: 0.8rem; color: var(--text-tertiary);">Review for: <strong>${t.product_name}</strong></p>` : ''}
             </div>
        </div>
    `).join('');
}

// Modal Functions (Product)
window.openProductModal = async (productId = null) => {
    await populateCategoryOptions(); // Ensure categories are loaded
    productModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset form
    productForm.reset();
    variantsContainer.innerHTML = '';
    document.getElementById('productId').value = '';
    document.getElementById('productOrder').value = '0'; // Default order
    document.getElementById('productVisible').checked = true; // Default visible

    // Reset image gallery
    currentProductImages = [];
    renderImageGallery();
    document.getElementById('bulkUploadStatus').textContent = '';

    if (productId) {
        modalTitle.textContent = 'Edit Product';
        loadProductData(productId);
    } else {
        editSnapshot = null; // New Product
        modalTitle.textContent = 'Add Product';
        addVariantRow(); // Always add one empty variant row
    }
};


window.closeProductModal = () => {
    productModal.style.display = 'none';
    document.body.style.overflow = '';
};

// Testimonial Modal Functions
window.openTestimonialModal = (id = null) => {
    testimonialModal.style.display = 'flex';
    testimonialForm.reset();
    document.getElementById('testimonialId').value = '';

    if (id) {
        testimonialModalTitle.textContent = 'Edit Testimonial';
        loadTestimonialData(id);
    } else {
        editSnapshot = null; // New
        testimonialModalTitle.textContent = 'Add Testimonial';
    }
};

window.closeTestimonialModal = () => {
    testimonialModal.style.display = 'none';
};

async function loadTestimonialData(id) {
    try {
        const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();
        if (error) throw error;

        if (data) {
            editSnapshot = JSON.parse(JSON.stringify(data)); // Snapshot
            document.getElementById('testimonialId').value = data.id;
            document.getElementById('tName').value = data.name;
            document.getElementById('tLocation').value = data.location || '';
            document.getElementById('tMessage').value = data.message;
            document.getElementById('tRating').value = data.rating || 5;
            document.getElementById('tProduct').value = data.product_name || '';
        }
    } catch (e) {
        console.error('Error loading testimonial:', e);
        showToast('Could not load testimonial data.', 'error');
        closeTestimonialModal();
    }
}

// Helper to add variant row
window.addVariantRow = (data = null) => {
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.style.cssText = 'display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr 1.2fr 1.5fr auto; gap: 10px; margin-bottom: 20px; align-items: start; background: white; padding: 15px; border-radius: 12px; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);';

    div.innerHTML = `
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Qty/Size</label>
            <input type="text" class="variant-qty form-input" placeholder="e.g. 250g" value="${data ? data.quantity : ''}" required style="padding: 10px;">
        </div>
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">MRP (₹)</label>
            <input type="number" class="variant-mrp form-input" placeholder="MRP" value="${data ? data.mrp || '' : ''}" required style="padding: 10px;">
        </div>
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Price (₹)</label>
            <input type="number" class="variant-price form-input" placeholder="Price" value="${data ? data.price : ''}" required style="padding: 10px;">
        </div>
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Stock</label>
            <input type="number" class="variant-stock form-input" placeholder="Qty" value="${data ? data.stock || 0 : 0}" required style="padding: 10px;">
        </div>
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Batch</label>
            <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" class="variant-sold-batch form-input" value="${data ? data.current_sold || data.total_sold || 0 : 0}" readonly style="padding: 10px; background: #f8fafc; font-weight: bold; width: 45px;">
                <button type="button" class="nav-btn" onclick="window.resetVariantSold(this)" style="padding: 8px; font-size: 0.75rem; min-width: auto; height: 40px; color: var(--color-primary-blue);" title="Reset Batch Sales">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>
        <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Global</label>
            <input type="number" class="variant-sold-global form-input" value="${data ? data.global_sold || data.total_sold || 0 : 0}" readonly style="padding: 10px; background: #f1f5f9; color: #64748b; font-weight: bold; width: 55px;">
        </div>
        <div style="grid-column: span 1;">
            <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">Packaging Type</label>
            <select class="variant-packaging form-input" style="padding: 10px; width: 100%;">
                <option value="">Select Type</option>
                <option value="Pouch" ${data && data.packaging_type === 'Pouch' ? 'selected' : ''}>Pouch</option>
                <option value="Standup Pouch" ${data && data.packaging_type === 'Standup Pouch' ? 'selected' : ''}>Standup Pouch</option>
                <option value="Glass Jar" ${data && data.packaging_type === 'Glass Jar' ? 'selected' : ''}>Glass Jar</option>
                <option value="PET Jar" ${data && data.packaging_type === 'PET Jar' ? 'selected' : ''}>PET Jar</option>
            </select>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="nav-btn" style="color: #ef4444; border-color: #ef4444; margin-top: 26px; min-width: auto; padding: 10px;" title="Delete Variant">
            <i class="fas fa-trash"></i>
        </button>
    `;

    variantsContainer.appendChild(div);
};

window.resetVariantSold = (btn) => {
    if (!confirm('Are you sure you want to reset BATCH sales for this variant to 0? Global sales will be preserved.')) return;
    const row = btn.closest('.variant-row');
    const input = row.querySelector('.variant-sold-batch');
    if (input) input.value = 0;
};

async function loadProductData(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        // Capture snapshot for diffing
        editSnapshot = JSON.parse(JSON.stringify(product));

        // Populate form
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.product_name;
        document.getElementById('productNameTelugu').value = product.product_name_telugu || '';
        document.getElementById('productCategory').value = product.product_category;
        document.getElementById('productTagline').value = product.product_tagline || '';
        document.getElementById('productDescription').value = product.product_description || '';

        // New Fields
        document.getElementById('productIngredients').value = product.ingredients || '';
        document.getElementById('productUsage').value = product.serving_suggestion || '';
        document.getElementById('productShelfLife').value = product.shelf_life || '';
        document.getElementById('productRefrigeration').checked = product.is_refrigerated || false;

        // Nutrition Parsing
        let nutri = product.nutrition_info || {};
        try {
            if (typeof nutri === 'string') nutri = JSON.parse(nutri);
        } catch (e) {
            console.warn('Error parsing nutrition info:', e);
            nutri = {};
        }
        // Map JSON snake_case to Form IDs
        document.getElementById('nutriDetails').value = nutri.serving_size || nutri.details || ''; // Backwards compat
        document.getElementById('nutriCalories').value = nutri.calories || '';
        document.getElementById('nutriProtein').value = nutri.protein || '';
        document.getElementById('nutriSatFat').value = nutri.saturated_fat || nutri.satFat || '';
        document.getElementById('nutriFat').value = nutri.total_fat || nutri.fat || '';
        document.getElementById('nutriCarbs').value = nutri.carbs || '';
        document.getElementById('nutriFiber').value = nutri.fiber || '';
        document.getElementById('nutriSugars').value = nutri.sugars || '';
        document.getElementById('nutriSodium').value = nutri.sodium || '';
        // document.getElementById('prodNutrition').value = typeof product.nutrition_info === 'object' ? JSON.stringify(product.nutrition_info, null, 2) : (product.nutrition_info || '');

        // Load product images from product_images table
        currentProductImages = await fetchProductImages(productId);

        // If no images in new table, check for legacy showcase_image
        if (currentProductImages.length === 0 && product.showcase_image) {
            // Migrate legacy single image to new format
            currentProductImages = [{
                id: 'legacy_' + Date.now(),
                product_id: productId,
                image_url: product.showcase_image,
                is_default: true,
                tags: [],
                display_order: 0,
                isNew: true // Will be saved to product_images on next save
            }];
        }

        renderImageGallery();

        document.getElementById('showcaseImage').value = product.showcase_image || '';


        // Handle Variants
        // Handle Variants
        variantsContainer.innerHTML = ''; // Clear existing

        let variants = [];
        try {
            variants = typeof product.quantity_variants === 'string' ? JSON.parse(product.quantity_variants) : (product.quantity_variants || []);
        } catch (e) {
            console.warn('Error parsing variants:', e);
            variants = [];
        }

        // Populate variants
        if (variants && variants.length > 0) {
            variants.forEach(variant => {
                addVariantRow(variant);
            });
        } else {
            addVariantRow();
        }

        // Populate display order
        document.getElementById('productOrder').value = product.display_order || 0;
        document.getElementById('productTrending').checked = product.is_trending || false;
        document.getElementById('productVisible').checked = product.is_visible !== false; // Default true if null

    } catch (error) {
        console.error('Error loading product:', error);
        console.error('Error details:', error.message, error.stack); // Added stack trace
        showToast('Error loading product data: ' + error.message, 'error'); // Show actual error in toast
        closeProductModal();
    }
}

// Product Slug Uniqueness Helper
async function ensureUniqueSlug(baseSlug, existingId = null) {
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
        // Query to see if slug exists
        let query = supabase.from('products').select('id').eq('slug', slug);

        // If updating, exclude self from check
        if (existingId) {
            query = query.neq('id', existingId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Slug check error:', error);
            throw error; // Fail safe
        }

        if (data && data.length > 0) {
            // Collision found, append counter
            slug = `${baseSlug}-${counter}`;
            counter++;
        } else {
            isUnique = true;
        }
    }
    return slug;
}

// Form Submission (Product)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const submitBtn = productForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    // Collect Variants
    let variants = [];
    let calculatedTotalStock = 0;
    let calculatedTotalSold = 0;

    // First check variant rows
    document.querySelectorAll('.variant-row').forEach(row => {
        const qty = row.querySelector('.variant-qty').value;
        const price = row.querySelector('.variant-price').value;
        const stock = parseInt(row.querySelector('.variant-stock').value || 0);
        const currentSold = parseInt(row.querySelector('.variant-sold-batch').value || 0);
        const globalSold = parseInt(row.querySelector('.variant-sold-global').value || 0);

        if (qty && price) {
            variants.push({
                quantity: qty,
                price: parseFloat(price),
                mrp: parseFloat(row.querySelector('.variant-mrp').value || 0),
                stock: stock,
                current_sold: currentSold,
                global_sold: globalSold,
                packaging_type: row.querySelector('.variant-packaging').value
            });
            calculatedTotalStock += stock;
            calculatedTotalSold += globalSold; // Product level tracking uses global total
        }
    });

    // IF NO VARIANT ROWS, Add one empty (User should fill it)
    if (variants.length === 0) {
        alert('Please add at least one variant.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }

    // Determine Logic for Top-Level Fields (Display Purposes)
    // We'll use the FIRST variant for the main table display values
    const firstVariant = variants[0];
    const topMrp = firstVariant.mrp;
    const topNetWeight = firstVariant.quantity;

    // Generate slug from product name
    const productName = document.getElementById('productName').value;
    const baseSlug = generateSlug(productName);

    try {
        // Ensure Slug Uniqueness
        const uniqueSlug = await ensureUniqueSlug(baseSlug, productId);

        const productData = {
            product_name: productName,
            product_name_telugu: document.getElementById('productNameTelugu').value,
            product_category: document.getElementById('productCategory').value,
            product_tagline: document.getElementById('productTagline').value,
            product_description: document.getElementById('productDescription').value,
            ingredients: document.getElementById('productIngredients').value,
            serving_suggestion: document.getElementById('productUsage').value,
            shelf_life: document.getElementById('productShelfLife').value,
            is_refrigerated: document.getElementById('productRefrigeration').checked, // New Field
            nutrition_info: {
                // Save as snake_case standard
                serving_size: document.getElementById('nutriDetails').value,
                total_servings: '20', // Defaulting to 20 or we could add a field for it? User didn't ask for field but existing data has it. Let's keep it simple or default.
                calories: document.getElementById('nutriCalories').value,
                protein: document.getElementById('nutriProtein').value,
                saturated_fat: document.getElementById('nutriSatFat').value,
                total_fat: document.getElementById('nutriFat').value,
                carbs: document.getElementById('nutriCarbs').value,
                fiber: document.getElementById('nutriFiber').value,
                sugars: document.getElementById('nutriSugars').value,
                sodium: document.getElementById('nutriSodium').value
            },
            mrp: topMrp,
            net_weight: topNetWeight,
            total_stock: calculatedTotalStock,
            global_sold: calculatedTotalSold,
            is_trending: document.getElementById('productTrending').checked,
            is_visible: document.getElementById('productVisible').checked,
            quantity_variants: variants,
            slug: uniqueSlug
        };

        // Determine display_order based on category
        const newCategory = productData.product_category;
        let needsNewDisplayOrder = false;

        if (productId) {
            // Check if category changed
            const oldCategory = editSnapshot?.product_category;
            if (oldCategory && oldCategory !== newCategory) {
                // Category changed - need new display_order in the new category
                needsNewDisplayOrder = true;
            }
        } else {
            // New product - always needs display_order
            needsNewDisplayOrder = true;
        }

        if (needsNewDisplayOrder) {
            // Get max display_order in the target category
            const { data: maxOrderData, error: maxError } = await supabase
                .from('products')
                .select('display_order')
                .eq('product_category', newCategory)
                .order('display_order', { ascending: false })
                .limit(1);

            if (!maxError && maxOrderData && maxOrderData.length > 0) {
                productData.display_order = (maxOrderData[0].display_order || 0) + 1;
            } else {
                productData.display_order = 1; // First product in this category
            }
        }

        let error;
        let savedProductId = productId;

        if (productId) {
            // Update
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId);
            error = updateError;
        } else {
            // Insert - need to get the new ID
            const { data: insertedData, error: insertError } = await supabase
                .from('products')
                .insert([productData])
                .select('id')
                .single();
            error = insertError;
            if (insertedData) {
                savedProductId = insertedData.id;
            }
        }

        if (error) throw error;

        // Save product images to product_images table
        if (savedProductId && currentProductImages.length > 0) {
            await saveProductImages(savedProductId);
        }

        closeProductModal();
        fetchProducts();

        let toastMsg = 'Product saved successfully!';
        if (productId) {
            const changes = getChanges(editSnapshot, productData);
            toastMsg = `Updated: ${changes.join(', ')}`;
        } else {
            toastMsg = 'Created New Product';
        }
        showToast(toastMsg, 'success');

    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving product: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});


// Form Submission (Testimonial)
if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tId = document.getElementById('testimonialId').value;
        const submitBtn = testimonialForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        const tData = {
            name: document.getElementById('tName').value,
            location: document.getElementById('tLocation').value,
            message: document.getElementById('tMessage').value,
            rating: parseInt(document.getElementById('tRating').value),
            product_name: document.getElementById('tProduct').value
        };

        try {
            let error;
            if (tId) {
                // Update
                const { error: updateError } = await supabase
                    .from('testimonials')
                    .update(tData)
                    .eq('id', tId);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('testimonials')
                    .insert([tData]);
                error = insertError;
            }

            if (error) throw error;

            closeTestimonialModal();
            fetchTestimonials();

            let toastMsg = 'Testimonial saved!';
            if (tId) {
                const changes = getChanges(editSnapshot, tData);
                toastMsg = `Updated: ${changes.join(', ')}`;
            } else {
                toastMsg = 'Created New Testimonial';
            }
            showToast(toastMsg, 'success');

        } catch (error) {
            showToast('Error saving testimonial: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}



// Delete Product
window.deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        fetchProducts();
    } catch (error) {
        alert('Error deleting product: ' + error.message);
    }
};

// Delete Testimonial
window.deleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;

    try {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;

        fetchTestimonials();
    } catch (error) {
        alert('Error deleting testimonial: ' + error.message);
    }
};

// Expose functions to window for onclick handlers
// Expose functions to window for onclick handlers
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.editProduct = (id) => openProductModal(id);
window.editTestimonial = (id) => openTestimonialModal(id);

/*
========================================
PRODUCT IMAGE GALLERY MANAGEMENT
========================================
*/

// Available image tags
const IMAGE_TAGS = ['PET Jar', 'Glass Jar', 'Standup Pouch', 'Packet', 'Front View', 'Back View', 'Lifestyle'];

// Temp storage for images being edited (before saving to DB)
let currentProductImages = [];

// Fetch product images from database
async function fetchProductImages(productId) {
    if (!productId) return [];

    try {
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', productId)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching product images:', e);
        return [];
    }
}

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'telugudelicacies';
const CLOUDINARY_UPLOAD_PRESET = 'product_images'; // User must create this preset in Cloudinary settings

// Upload single image to Cloudinary and return URL
async function uploadImageToStorage(file, customPublicId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'products'); // Organize in products folder

    // If a custom public ID is provided (without extension), suggest it to Cloudinary
    // Note: 'use_filename' must be true in preset, or we use 'public_id' param if unsigned allowed it (often restricted)
    // Safer to just RELY ON FILE NAME being meaningful if preset has "Use filename or external ID" checked.
    // So we just ensure 'file.name' is good before passing here.

    // However, if we CAN set public_id (requires specific unsigned settings), we try:
    if (customPublicId) {
        // formData.append('public_id', customPublicId); 
        // Often blocked in unsigned. Let's rely on the file object having a correct name constructor
    }

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return data.secure_url; // Return the HTTPS URL
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

// ==========================================
// MIGRATION TOOL: Products Table (Showcase/Info) -> Cloudinary
// ==========================================
window.migrateProductsTableToCloudinary = async function () {
    if (!confirm("This will migrate MAIN product images (Showcase/Info) from Supabase to Cloudinary. Continue?")) return;

    const progressDiv = document.getElementById('migrationProgress');
    const progressBar = document.getElementById('migrationBar');
    const progressText = document.getElementById('migrationStatusText');
    const progressCount = document.getElementById('migrationCount');

    if (progressDiv) progressDiv.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.innerText = 'Scanning products table...';

    try {
        // 1. Fetch products with Supabase images
        const { data: products, error } = await supabase
            .from('products')
            .select('id, product_name, slug, showcase_image, info_image');

        if (error) throw error;

        // Filter locally for Supabase URLs
        const toMigrate = [];
        for (const p of products) {
            let needsMigration = false;
            let type = '';

            if (p.showcase_image && p.showcase_image.includes('supabase.co')) {
                toMigrate.push({ id: p.id, field: 'showcase_image', url: p.showcase_image, slug: p.slug, name: p.product_name });
            }
            if (p.info_image && p.info_image.includes('supabase.co')) {
                toMigrate.push({ id: p.id, field: 'info_image', url: p.info_image, slug: p.slug, name: p.product_name });
            }
        }

        if (toMigrate.length === 0) {
            if (progressText) progressText.innerText = 'No Supabase images found in products table.';
            showToast('All main product images are already migrated!', 'success');
            return;
        }

        const total = toMigrate.length;
        let migrated = 0;
        let failed = 0;

        if (progressCount) progressCount.innerText = `0/${total}`;

        // 2. Migrate
        for (const item of toMigrate) {
            try {
                if (progressText) progressText.innerText = `Migrating ${item.name} (${item.field})...`;

                // Fetch Blob
                const response = await fetch(item.url);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const blob = await response.blob();

                // Create Meaningful Filename: slug-field.jpg
                const ext = item.url.split('.').pop().split('?')[0] || 'jpg';
                const filename = `${item.slug}-${item.field === 'showcase_image' ? 'showcase' : 'info'}.${ext}`;
                const file = new File([blob], filename, { type: blob.type });

                // Upload
                const newUrl = await uploadImageToStorage(file);

                // Update DB
                const updateObj = {};
                updateObj[item.field] = newUrl;

                const { error: updateError } = await supabase
                    .from('products')
                    .update(updateObj)
                    .eq('id', item.id);

                if (updateError) throw updateError;

                migrated++;
            } catch (e) {
                console.error('Migration failed:', item, e);
                failed++;
            }

            // Progress
            const pct = Math.round(((migrated + failed) / total) * 100);
            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressCount) progressCount.innerText = `${migrated + failed}/${total}`;
        }

        if (progressText) progressText.innerText = `Main Images Migration Complete! ${migrated} success, ${failed} failed.`;
        showToast(`Migrated ${migrated} main product images`, 'success');

    } catch (e) {
        console.error('Error migrating products table:', e);
        showToast('Error migrating main images', 'error');
    }
};

// Bulk upload images
async function handleBulkImageUpload(files, productId) {
    const statusEl = document.getElementById('bulkUploadStatus');
    const total = files.length;
    let uploaded = 0;

    statusEl.textContent = `Uploading 0/${total}...`;
    statusEl.style.color = 'var(--text-secondary)';

    try {
        for (const file of files) {
            const imageUrl = await uploadImageToStorage(file);

            // Add to local array (we'll save to DB when form submits)
            const newImage = {
                id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(7),
                product_id: productId || null,
                image_url: imageUrl,
                is_default: currentProductImages.length === 0, // First image is default
                tags: [],
                display_order: currentProductImages.length,
                isNew: true // Flag for new images
            };

            currentProductImages.push(newImage);
            uploaded++;
            statusEl.textContent = `Uploading ${uploaded}/${total}...`;
        }

        statusEl.textContent = `✓ ${uploaded} images uploaded`;
        statusEl.style.color = '#10b981';

        // Re-render gallery
        renderImageGallery();

    } catch (error) {
        console.error('Bulk upload error:', error);
        statusEl.textContent = 'Error: ' + error.message;
        statusEl.style.color = '#ef4444';
    }
}

// Render image gallery in modal
function renderImageGallery() {
    const gallery = document.getElementById('productImageGallery');
    const countEl = document.getElementById('imageGalleryCount');
    const placeholder = document.getElementById('imageGalleryPlaceholder');

    if (!gallery) return;

    // Update count
    countEl.textContent = `${currentProductImages.length} image${currentProductImages.length !== 1 ? 's' : ''}`;

    // Clear gallery but keep placeholder
    gallery.innerHTML = '';

    if (currentProductImages.length === 0) {
        gallery.innerHTML = `
            <div id="imageGalleryPlaceholder" style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px;">
                <i class="fas fa-images" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0; font-size: 0.85rem;">No images yet. Upload images below.</p>
            </div>
        `;
        document.getElementById('showcaseImage').value = '';
        return;
    }

    // Render each image card
    currentProductImages.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = `image-gallery-card ${img.is_default ? 'is-default' : ''}`;
        card.dataset.imageId = img.id;

        card.innerHTML = `
            <img src="${img.image_url}" alt="Product image ${index + 1}" onerror="this.src='./images/placeholder-product.jpg'">
            <div class="card-actions">
                <button type="button" class="btn-default ${img.is_default ? 'active' : ''}" 
                        onclick="setDefaultImage('${img.id}')" title="Set as default">
                    <i class="fas fa-star"></i>
                </button>
                <button type="button" class="btn-delete" onclick="removeProductImage('${img.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-tags">
                <select multiple size="2" onchange="updateImageTags('${img.id}', this)">
                    ${IMAGE_TAGS.map(tag => `
                        <option value="${tag}" ${(img.tags || []).includes(tag) ? 'selected' : ''}>${tag}</option>
                    `).join('')}
                </select>
            </div>
        `;

        gallery.appendChild(card);
    });

    // Update hidden showcase image field with default image URL
    const defaultImg = currentProductImages.find(img => img.is_default);
    document.getElementById('showcaseImage').value = defaultImg ? defaultImg.image_url : (currentProductImages[0]?.image_url || '');
}

// Set default image
window.setDefaultImage = (imageId) => {
    currentProductImages.forEach(img => {
        img.is_default = (img.id === imageId);
    });
    renderImageGallery();
};

// Update image tags
window.updateImageTags = (imageId, selectEl) => {
    const selectedTags = Array.from(selectEl.selectedOptions).map(opt => opt.value);
    const img = currentProductImages.find(i => i.id === imageId);
    if (img) {
        img.tags = selectedTags;
    }
};

// Remove image from gallery
window.removeProductImage = (imageId) => {
    if (!confirm('Remove this image?')) return;

    const index = currentProductImages.findIndex(img => img.id === imageId);
    if (index > -1) {
        const wasDefault = currentProductImages[index].is_default;
        currentProductImages.splice(index, 1);

        // If removed image was default, make first image default
        if (wasDefault && currentProductImages.length > 0) {
            currentProductImages[0].is_default = true;
        }
    }

    renderImageGallery();
};

// Save product images to database
async function saveProductImages(productId) {
    if (!productId) return;

    try {
        // Delete existing images for this product
        const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId);

        if (deleteError) throw deleteError;

        // Insert all current images
        if (currentProductImages.length > 0) {
            const imagesToInsert = currentProductImages.map((img, index) => ({
                product_id: productId,
                image_url: img.image_url,
                is_default: img.is_default,
                tags: img.tags || [],
                display_order: index
            }));

            const { error: insertError } = await supabase
                .from('product_images')
                .insert(imagesToInsert);

            if (insertError) throw insertError;
        }

        return true;
    } catch (e) {
        console.error('Error saving product images:', e);
        throw e;
    }
}

// Setup bulk upload listener
const setupImageGalleryListeners = () => {
    const bulkUpload = document.getElementById('bulkImageUpload');

    if (bulkUpload) {
        bulkUpload.addEventListener('change', (e) => {
            const productId = document.getElementById('productId').value;
            handleBulkImageUpload(Array.from(e.target.files), productId);
            e.target.value = ''; // Reset input
        });
    }
};

// Initialize listeners
setupImageGalleryListeners();

/*
========================================
BULK IMAGES UPLOAD WITH PRODUCT MATCHING
========================================
*/

// Store for pending bulk uploads
let pendingBulkImages = [];
let allProductsCache = [];

// Open bulk images modal
window.openBulkImagesModal = async function () {
    const modal = document.getElementById('bulkImagesModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset state
    pendingBulkImages = [];
    document.getElementById('bulkImagesPreview').innerHTML = '';
    document.getElementById('bulkImagesSummary').style.display = 'none';
    document.getElementById('bulkUploadSaveBtn').style.display = 'none';
    document.getElementById('bulkImagesProgress').style.display = 'none';

    // Cache all products for matching
    try {
        const { data, error } = await supabase.from('products').select('id, product_name, slug');
        if (!error) allProductsCache = data || [];
    } catch (e) {
        console.error('Error fetching products for matching:', e);
    }

    // Setup drag-drop
    setupBulkDragDrop();
};

// Close modal
window.closeBulkImagesModal = function () {
    document.getElementById('bulkImagesModal').style.display = 'none';
    document.body.style.overflow = '';
    pendingBulkImages = [];
    existingImagesEdits = {};
};

// Tab switching
window.switchBulkTab = function (tab) {
    const uploadTab = document.getElementById('bulkTabUpload');
    const editTab = document.getElementById('bulkTabEdit');
    const uploadSection = document.getElementById('bulkUploadSection');
    const editSection = document.getElementById('bulkEditSection');

    if (tab === 'upload') {
        uploadTab.classList.add('active');
        editTab.classList.remove('active');
        uploadSection.style.display = 'block';
        editSection.style.display = 'none';
    } else {
        uploadTab.classList.remove('active');
        editTab.classList.add('active');
        uploadSection.style.display = 'none';
        editSection.style.display = 'block';

        // Populate product filter and load images
        populateEditProductFilter();
        loadExistingImages('all');
    }
};

// Track edits to existing images
let existingImagesEdits = {};
let existingImagesData = [];

// Populate product filter dropdown
async function populateEditProductFilter() {
    const filter = document.getElementById('editImageProductFilter');
    if (!filter) return;

    // Use cached products
    filter.innerHTML = '<option value="all">All Products</option>' +
        allProductsCache.map(p => `<option value="${p.id}">${p.product_name}</option>`).join('');
}

// Load existing images from database
window.loadExistingImages = async function () {
    const grid = document.getElementById('existingImagesGrid');
    const productFilterVal = document.getElementById('editImageProductFilter')?.value || 'all';
    const tagFilterVal = document.getElementById('editImageTagFilter')?.value || 'all';

    grid.innerHTML = '<p style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';

    try {
        let query = supabase.from('product_images').select('*, products(product_name)');

        if (productFilterVal && productFilterVal !== 'all') {
            query = query.eq('product_id', productFilterVal);
        }

        if (tagFilterVal && tagFilterVal !== 'all') {
            query = query.contains('tags', [tagFilterVal]);
        }

        const { data: images, error } = await query.order('created_at', { ascending: false }).limit(100);

        if (error) throw error;

        if (!images || images.length === 0) {
            grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-secondary);">No images found matching criteria.</p>';
            return;
        }

        existingImagesData = images;
        existingImagesEdits = {};

        const bulkTags = ['Default', 'PET Jar', 'Glass Jar', 'Standup Pouch', 'Packet', 'Front View', 'Back View', 'Lifestyle'];

        grid.innerHTML = images.map((img, idx) => `
            <div class="bulk-preview-item" data-id="${img.id}">
                <img src="${img.image_url}" alt="Product image" loading="lazy">
                <div class="file-info">
                    <div class="file-name">${img.products?.product_name || 'Unknown Product'}</div>
                    <div class="match-result matched">
                        <i class="fas fa-link"></i> ${img.is_default ? '⭐ Default Image' : 'Additional Image'}
                    </div>
                </div>
                <div class="bulk-controls">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <select onchange="window.updateExistingImageProduct('${img.id}', this.value)" style="flex: 1;">
                            ${allProductsCache.map(p => `<option value="${p.id}" ${p.id === img.product_id ? 'selected' : ''}>${p.product_name}</option>`).join('')}
                        </select>
                        <button onclick="window.deleteExistingImage('${img.id}')" class="btn-delete-small" title="Delete Image" 
                            style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; padding: 0 10px; cursor: pointer;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="bulk-tags-row">
                        ${bulkTags.map(tag => `
                            <label class="bulk-tag-chip ${(img.tags || []).includes(tag) ? 'active' : ''}">
                                <input type="checkbox" ${(img.tags || []).includes(tag) ? 'checked' : ''} 
                                    onchange="window.updateExistingImageTag('${img.id}', '${tag}', this.checked)">
                                ${tag}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error('Error loading existing images:', e);
        grid.innerHTML = '<p style="text-align:center; padding:30px; color:#dc2626;">Error loading images. Make sure the product_images table exists.</p>';
    }
};

// Delete existing image
window.deleteExistingImage = async function (id) {
    if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

    // Optimistic UI update
    const item = document.querySelector(`.bulk-preview-item[data-id="${id}"]`);
    if (item) item.style.opacity = '0.5';

    try {
        const { error } = await supabase
            .from('product_images')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Remove from UI
        if (item) item.remove();
        showToast('Image deleted successfully', 'success');

    } catch (e) {
        console.error('Error deleting image:', e);
        if (item) item.style.opacity = '1';
        showToast('Error deleting image', 'error');
    }
};

// Track product assignment change
window.updateExistingImageProduct = function (imageId, newProductId) {
    if (!existingImagesEdits[imageId]) {
        existingImagesEdits[imageId] = {};
    }
    existingImagesEdits[imageId].product_id = newProductId;
};

// Track tag change & Enforce Unique Tags
window.updateExistingImageTag = async function (imageId, tag, isChecked) {
    const img = existingImagesData.find(i => i.id === imageId);
    if (!img) return;

    if (!existingImagesEdits[imageId]) {
        existingImagesEdits[imageId] = { tags: [...(img.tags || [])] };
    }
    if (!existingImagesEdits[imageId].tags) {
        existingImagesEdits[imageId].tags = [...(img.tags || [])];
    }

    // CHECK FOR DUPLICATES IF ADDING A TAG
    if (isChecked) {
        // Find current product ID (could be edited or original)
        const currentProductId = existingImagesEdits[imageId]?.product_id || img.product_id;

        // Check if any OTHER image for this product already has this tag
        const duplicateImg = existingImagesData.find(otherImg => {
            if (otherImg.id === imageId) return false; // Skip self

            // Check product match (handle if other image was also edited)
            const otherProductId = existingImagesEdits[otherImg.id]?.product_id || otherImg.product_id;
            if (otherProductId !== currentProductId) return false;

            // Check if it has the tag (handle edits)
            const otherTags = existingImagesEdits[otherImg.id]?.tags || otherImg.tags || [];
            return otherTags.includes(tag);
        });

        if (duplicateImg) {
            const confirmReplace = confirm(
                `Product already has an image tagged "${tag}".\n\nDo you want to MOVE this tag to the current image?`
            );

            if (!confirmReplace) {
                // Revert checkbox in UI
                const checkbox = document.querySelector(`.bulk-preview-item[data-id="${imageId}"] input[onchange*="'${tag}'"]`);
                if (checkbox) checkbox.checked = false;
                return; // Stop
            }

            // Remove tag from the OTHER image
            if (!existingImagesEdits[duplicateImg.id]) {
                existingImagesEdits[duplicateImg.id] = { tags: [...(duplicateImg.tags || [])] };
            }
            if (!existingImagesEdits[duplicateImg.id].tags) {
                existingImagesEdits[duplicateImg.id].tags = [...(duplicateImg.tags || [])];
            }
            // Remove the tag
            existingImagesEdits[duplicateImg.id].tags = existingImagesEdits[duplicateImg.id].tags.filter(t => t !== tag);

            // Update UI for the OTHER image (uncheck it)
            const otherCheckbox = document.querySelector(`.bulk-preview-item[data-id="${duplicateImg.id}"] input[onchange*="'${tag}'"]`);
            if (otherCheckbox) {
                otherCheckbox.checked = false;
                otherCheckbox.parentElement.classList.remove('active');
            }
            showToast(`Tag "${tag}" moved to this image.`, 'info');
        }
    }

    if (isChecked && !existingImagesEdits[imageId].tags.includes(tag)) {
        existingImagesEdits[imageId].tags.push(tag);
    } else if (!isChecked) {
        existingImagesEdits[imageId].tags = existingImagesEdits[imageId].tags.filter(t => t !== tag);
    }

    // Update current chip visual
    const checkbox = document.querySelector(`.bulk-preview-item[data-id="${imageId}"] input[onchange*="'${tag}'"]`);
    if (checkbox && checkbox.parentElement) {
        if (isChecked) checkbox.parentElement.classList.add('active');
        else checkbox.parentElement.classList.remove('active');
    }
};

// Save all changes to existing images
window.saveExistingImageChanges = async function () {
    const editIds = Object.keys(existingImagesEdits);
    if (editIds.length === 0) {
        showToast('No changes to save', 'info');
        return;
    }

    const btn = document.getElementById('saveExistingImagesBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    let saved = 0;
    let errors = 0;

    for (const imageId of editIds) {
        try {
            const updates = existingImagesEdits[imageId];
            const { error } = await supabase
                .from('product_images')
                .update(updates)
                .eq('id', imageId);

            if (error) throw error;
            saved++;
        } catch (e) {
            console.error('Error saving image:', e);
            errors++;
        }
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';

    if (saved > 0) {
        showToast(`Saved ${saved} image(s)${errors > 0 ? `, ${errors} failed` : ''}`, 'success');
        existingImagesEdits = {};
    } else {
        showToast('Failed to save changes', 'error');
    }
};


// Setup drag-drop handlers
function setupBulkDragDrop() {
    const dropZone = document.getElementById('bulkImagesDropZone');
    const fileInput = document.getElementById('bulkImagesInput');

    // File input change
    fileInput.onchange = (e) => handleBulkFilesSelected(Array.from(e.target.files));

    // Drag events
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    };

    dropZone.ondragleave = () => {
        dropZone.classList.remove('dragover');
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleBulkFilesSelected(Array.from(e.dataTransfer.files));
    };
}

// Fuzzy match filename to product
function matchFilenameToProduct(filename) {
    // Remove extension and special chars
    const baseName = filename.replace(/\.[^/.]+$/, '') // Remove extension
        .toLowerCase()
        .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

    // Extract potential tags
    const tagKeywords = ['pet jar', 'glass jar', 'standup', 'pouch', 'front', 'back', 'lifestyle'];
    const foundTags = [];
    let searchName = baseName;

    tagKeywords.forEach(tag => {
        if (baseName.includes(tag)) {
            foundTags.push(tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            searchName = searchName.replace(tag, '').trim();
        }
    });

    // Try to find matching product
    let bestMatch = null;
    let bestScore = 0;

    allProductsCache.forEach(product => {
        const productName = product.product_name.toLowerCase();
        const productSlug = (product.slug || '').toLowerCase();

        // Exact match check
        if (searchName === productName || searchName === productSlug) {
            bestMatch = product;
            bestScore = 100;
            return;
        }

        // Partial match - calculate similarity
        const words = searchName.split(' ').filter(w => w.length > 2);
        let matchedWords = 0;

        words.forEach(word => {
            if (productName.includes(word) || productSlug.includes(word)) {
                matchedWords++;
            }
        });

        const score = words.length > 0 ? (matchedWords / words.length) * 100 : 0;

        if (score > bestScore && score >= 50) { // At least 50% match
            bestScore = score;
            bestMatch = product;
        }
    });

    return { product: bestMatch, score: bestScore, tags: foundTags };
}

// Handle files selected
async function handleBulkFilesSelected(files) {
    const preview = document.getElementById('bulkImagesPreview');
    const summary = document.getElementById('bulkImagesSummary');
    const saveBtn = document.getElementById('bulkUploadSaveBtn');

    // Filter only images
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        showToast('Please select image files only', 'error');
        return;
    }

    let matchedCount = 0;
    let unmatchedCount = 0;

    // Process each file
    for (const file of imageFiles) {
        const match = matchFilenameToProduct(file.name);
        const objectUrl = URL.createObjectURL(file);

        const item = {
            file: file,
            previewUrl: objectUrl,
            matchedProduct: match.product,
            matchScore: match.score,
            tags: match.tags,
            manualProductId: null
        };

        pendingBulkImages.push(item);

        if (match.product) matchedCount++;
        else unmatchedCount++;

        // Render preview item - always show dropdown for override capability
        const selectedProductId = match.product?.id || '';
        const bulkTags = ['Default', 'PET Jar', 'Glass Jar', 'Standup Pouch', 'Front View', 'Back View', 'Lifestyle'];
        const detectedTags = match.tags || [];

        const html = `
            <div class="bulk-preview-item" data-idx="${pendingBulkImages.length - 1}">
                <img src="${objectUrl}" alt="${file.name}">
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="match-result ${match.product ? 'matched' : 'unmatched'}">
                        ${match.product
                ? `<i class="fas fa-check-circle"></i> Auto-matched`
                : `<i class="fas fa-question-circle"></i> Select product`}
                    </div>
                </div>
                <div class="bulk-controls">
                    <select onchange="window.manualMatchProduct(${pendingBulkImages.length - 1}, this.value)" class="bulk-product-select">
                        <option value="">Select Product...</option>
                        ${allProductsCache.map(p => `<option value="${p.id}" ${p.id === selectedProductId ? 'selected' : ''}>${p.product_name}</option>`).join('')}
                    </select>
                    <div class="bulk-tags-row">
                        ${bulkTags.map(tag => `
                            <label class="bulk-tag-chip ${detectedTags.includes(tag) ? 'active' : ''}">
                                <input type="checkbox" ${detectedTags.includes(tag) ? 'checked' : ''} 
                                    onchange="window.toggleBulkTag(${pendingBulkImages.length - 1}, '${tag}', this.checked)">
                                ${tag}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;


        preview.insertAdjacentHTML('beforeend', html);
    }

    // Update summary
    document.getElementById('matchedCount').textContent = matchedCount;
    document.getElementById('unmatchedCount').textContent = unmatchedCount;
    summary.style.display = 'block';

    // Show save button if any matches
    if (matchedCount > 0) {
        saveBtn.style.display = 'inline-flex';
    }
}

// Manual product selection for unmatched files
window.manualMatchProduct = function (idx, productId) {
    if (idx < 0 || idx >= pendingBulkImages.length) return;

    pendingBulkImages[idx].manualProductId = productId;

    // Update UI
    const item = document.querySelector(`.bulk-preview-item[data-idx="${idx}"]`);
    const matchResult = item.querySelector('.match-result');

    if (productId) {
        const product = allProductsCache.find(p => p.id === productId);
        matchResult.className = 'match-result matched';
        matchResult.innerHTML = `<i class="fas fa-check-circle"></i> ${product?.product_name || 'Selected'}`;

        // Update matched count
        updateBulkMatchCounts();
    }
};

// Toggle tag for a bulk image
window.toggleBulkTag = function (idx, tag, isChecked) {
    if (idx < 0 || idx >= pendingBulkImages.length) return;

    const item = pendingBulkImages[idx];
    if (!item.tags) item.tags = [];

    if (isChecked && !item.tags.includes(tag)) {
        item.tags.push(tag);
    } else if (!isChecked) {
        item.tags = item.tags.filter(t => t !== tag);
    }

    // Update visual state of the chip
    const itemEl = document.querySelector(`.bulk-preview-item[data-idx="${idx}"]`);
    if (itemEl) {
        const chip = itemEl.querySelector(`label.bulk-tag-chip input[onchange*="'${tag}'"]`)?.parentElement;
        if (chip) {
            chip.classList.toggle('active', isChecked);
        }
    }
};

// Update match counts
function updateBulkMatchCounts() {
    let matched = 0;
    let unmatched = 0;

    pendingBulkImages.forEach(item => {
        if (item.matchedProduct || item.manualProductId) matched++;
        else unmatched++;
    });

    document.getElementById('matchedCount').textContent = matched;
    document.getElementById('unmatchedCount').textContent = unmatched;

    if (matched > 0) {
        document.getElementById('bulkUploadSaveBtn').style.display = 'inline-flex';
    }
}

// Save all matched images
window.saveBulkImages = async function () {
    const progress = document.getElementById('bulkImagesProgress');
    const progressBar = document.getElementById('bulkProgressBar');
    const progressText = document.getElementById('bulkProgressText');
    const saveBtn = document.getElementById('bulkUploadSaveBtn');

    // Filter matched images
    const toUpload = pendingBulkImages.filter(item => item.matchedProduct || item.manualProductId);

    if (toUpload.length === 0) {
        showToast('No matched images to upload', 'error');
        return;
    }

    saveBtn.disabled = true;
    progress.style.display = 'block';
    progressBar.style.width = '0%';

    let uploaded = 0;
    let errors = 0;

    for (const item of toUpload) {
        try {
            progressText.textContent = `Uploading ${uploaded + 1}/${toUpload.length}...`;

            // Upload to storage
            const imageUrl = await uploadImageToStorage(item.file);

            // Get product ID
            const productId = item.manualProductId || item.matchedProduct?.id;

            // Save to product_images table
            const { error } = await supabase.from('product_images').insert({
                product_id: productId,
                image_url: imageUrl,
                is_default: false,
                tags: item.tags || [],
                display_order: 99 // Will be sorted later
            });

            if (error) throw error;

            uploaded++;
            progressBar.style.width = `${(uploaded / toUpload.length) * 100}%`;

        } catch (e) {
            console.error('Error uploading image:', e);
            errors++;
        }
    }

    saveBtn.disabled = false;
    progress.style.display = 'none';

    if (uploaded > 0) {
        showToast(`Uploaded ${uploaded} images${errors > 0 ? `, ${errors} failed` : ''}`, 'success');
        closeBulkImagesModal();
    } else {
        showToast('Failed to upload images', 'error');
    }
};

// Legacy single image upload (kept for other uses like category images)
const handleImageUpload = async (file, statusElementId, inputElementId) => {
    const statusEl = document.getElementById(statusElementId);
    const inputEl = document.getElementById(inputElementId);

    if (!file) return;

    statusEl.textContent = 'Uploading...';
    statusEl.style.color = 'var(--text-secondary)';

    try {
        const publicUrl = await uploadImageToStorage(file);
        inputEl.value = publicUrl;
        statusEl.textContent = 'Upload Complete!';
        statusEl.style.color = '#10b981';
    } catch (error) {
        console.error('Upload Error:', error);
        statusEl.textContent = 'Error: ' + error.message;
        statusEl.style.color = 'red';
    }
};

// Event Listeners for Legacy Upload Inputs (categories, settings, etc.)
const setupUploadListeners = () => {
    // Legacy showcase upload removed - now using bulk upload
};

// Initialize listeners when script loads
setupUploadListeners();


// ========================================
// NUTRITION QUICK FILL FUNCTIONALITY
// ========================================
/**
 * Parses a nutrition string like:
 * "Calories: 14.95kcal, Protein: 0.63g, Carbs: 2.47g, Fiber: 0.91g, Sugar: 0.52g, Sodium: 0.11g"
 * OR without colons:
 * "Calories 20.88kcal, Protein 0.7g, Total Fat 1.49g, Carbs 1.51g"
 * And populates the corresponding nutrition input fields.
 */
const parseNutritionString = (inputString) => {
    if (!inputString || typeof inputString !== 'string') return { count: 0, filledServing: false };

    // Clean up the string
    const str = inputString.trim();

    // Define field mappings: key variations -> form input ID
    const fieldMappings = {
        // Calories
        'calories': 'nutriCalories',
        'cal': 'nutriCalories',
        'energy': 'nutriCalories',
        // Protein
        'protein': 'nutriProtein',
        // Carbs
        'carbs': 'nutriCarbs',
        'carbohydrates': 'nutriCarbs',
        'carbohydrate': 'nutriCarbs',
        // Fiber
        'fiber': 'nutriFiber',
        'fibre': 'nutriFiber',
        'dietary fiber': 'nutriFiber',
        // Sugar/Sugars
        'sugar': 'nutriSugars',
        'sugars': 'nutriSugars',
        // Sodium
        'sodium': 'nutriSodium',
        'salt': 'nutriSodium',
        // Total Fat
        'fat': 'nutriFat',
        'total fat': 'nutriFat',
        'totalfat': 'nutriFat',
        // Saturated Fat
        'saturated fat': 'nutriSatFat',
        'sat fat': 'nutriSatFat',
        'satfat': 'nutriSatFat',
        'saturatedfat': 'nutriSatFat',
        // Serving Size
        'serving size': 'nutriDetails',
        'serving': 'nutriDetails',
        'per serving': 'nutriDetails'
    };

    // Split by comma to get individual key-value pairs
    const parts = str.split(',');

    let matchedCount = 0;
    let filledServing = false;

    parts.forEach(part => {
        part = part.trim();
        if (!part) return;

        let key = '';
        let value = '';

        // Check if there's a colon separator
        const colonIndex = part.indexOf(':');
        if (colonIndex !== -1) {
            // Format: "Key: Value"
            key = part.substring(0, colonIndex).trim().toLowerCase();
            value = part.substring(colonIndex + 1).trim();
        } else {
            // Format: "Key Value" (e.g., "Calories 20.88kcal")
            // Find where the numeric value starts
            const match = part.match(/^([a-zA-Z\s]+)\s+([\d.]+.*)$/);
            if (match) {
                key = match[1].trim().toLowerCase();
                value = match[2].trim();
            }
        }

        if (!key || !value) return;

        // Try to find a matching field
        const inputId = fieldMappings[key];
        if (inputId) {
            const inputEl = document.getElementById(inputId);
            if (inputEl) {
                inputEl.value = value;
                matchedCount++;

                // Track if serving size was filled
                if (inputId === 'nutriDetails') {
                    filledServing = true;
                }

                // Add a brief highlight animation
                inputEl.classList.add('field-updated');
                setTimeout(() => {
                    inputEl.classList.remove('field-updated');
                }, 800);
            }
        }
    });

    return { count: matchedCount, filledServing };
};

// Event listener for Quick Fill input
const setupNutritionQuickFill = () => {
    const quickFillInput = document.getElementById('nutriQuickFill');

    if (quickFillInput) {
        // Common handler for both blur and Enter
        const handleQuickFill = (e) => {
            const val = e.target.value.trim();
            if (val) {
                const result = parseNutritionString(val);
                if (result.count > 0) {
                    e.target.value = ''; // Clear once filled

                    // Check if serving size was filled
                    if (!result.filledServing) {
                        // Highlight the serving size field to prompt user
                        const servingInput = document.getElementById('nutriDetails');
                        if (servingInput) {
                            servingInput.style.border = '2px solid #f59e0b';
                            servingInput.style.background = '#fef3c7';
                            servingInput.setAttribute('placeholder', '⚠️ Please enter serving size (e.g., 5g)');

                            // Focus on serving size field
                            setTimeout(() => servingInput.focus(), 100);

                            // Reset styling after user interacts
                            const resetStyle = () => {
                                servingInput.style.border = '';
                                servingInput.style.background = '';
                                servingInput.setAttribute('placeholder', 'e.g. Per 100g');
                                servingInput.removeEventListener('input', resetStyle);
                                servingInput.removeEventListener('blur', resetStyle);
                            };
                            servingInput.addEventListener('input', resetStyle);
                            servingInput.addEventListener('blur', resetStyle);
                        }

                        showToast(`Filled ${result.count} field(s). Please update Serving Size!`, 'info');
                    } else {
                        showToast(`Filled ${result.count} nutrition field(s)!`, 'success');
                    }
                }
            }
        };

        // Parse on blur (when user leaves the field)
        quickFillInput.addEventListener('blur', handleQuickFill);

        // Also parse on Enter key
        quickFillInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleQuickFill(e);
            }
        });
    }
};

// Initialize nutrition quick fill
setupNutritionQuickFill();


// Global Escape Key Listener to Close Modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const pModal = document.getElementById('productModal');
        const cModal = document.getElementById('categoryModal');
        const tModal = document.getElementById('testimonialModal');

        if (pModal && pModal.style.display === 'flex') {
            if (typeof window.closeProductModal === 'function') window.closeProductModal();
            else { pModal.style.display = 'none'; document.body.style.overflow = ''; }
        }
        if (cModal && cModal.style.display === 'flex') {
            if (typeof window.closeCategoryModal === 'function') window.closeCategoryModal();
            else cModal.style.display = 'none';
        }
        if (tModal && tModal.style.display === 'flex') {
            if (typeof window.closeTestimonialModal === 'function') window.closeTestimonialModal();
            else tModal.style.display = 'none';
        }
    }
});
// ----------------------------------------------------
// WHY US FEATURES MANAGEMENT
// ----------------------------------------------------

async function fetchWhyUsFeatures() {
    whyUsFeatureList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading...</td></tr>';
    try {
        const { data, error } = await supabase.from('why_us_features').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        renderWhyUsFeatures(data);
    } catch (e) {
        console.error(e);
        whyUsFeatureList.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Error: ${e.message}</td></tr>`;
    }
}

function renderWhyUsFeatures(features) {
    if (!features || features.length === 0) {
        whyUsFeatureList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No features found.</td></tr>';
        return;
    }

    whyUsFeatureList.innerHTML = features.map(f => `
        <div class="admin-product-card draggable-item" 
             draggable="true" 
             data-id="${f.id}" 
             data-type="why-us"
             data-order="${f.order_index}"
             style="cursor: move;"
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragenter="handleDragEnter(event)"
             ondragleave="handleDragLeave(event)">

             <div class="card-row" onclick="toggleCardDetails('${f.id}')" style="grid-template-columns: 80px 1fr 60px 100px 30px;">
                  <!-- Grip -->
                  <div style="position: absolute; left: 5px; color: #ccc;"><i class="fas fa-grip-vertical"></i></div>

                  <img src="${f.image_url || PLACEHOLDER_IMAGE}" style="margin-left: 15px;">

                  <div class="row-info">
                       <h3>${f.title}</h3>
                       <div class="tagline" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${f.description || 'No description'}</div>
                  </div>

                  <div class="display-order-cell" style="text-align: center; font-weight: bold; color: var(--text-secondary);">
                       ${f.order_index}
                  </div>

                  <div class="row-actions" onclick="event.stopPropagation()">
                      <button onclick="editWhyUsFeature('${f.id}')" class="admin-btn btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                      <button onclick="deleteWhyUsFeature('${f.id}')" class="admin-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>

                  <i class="fas fa-chevron-down" id="chevron-${f.id}" style="color: var(--text-secondary); transition: transform 0.2s;"></i>
             </div>

             <div class="card-expanded-details" id="details-${f.id}">
                 <h4 style="margin: 0 0 5px; color: var(--color-secondary-blue);">Description</h4>
                 <p style="margin: 0; color: var(--text-secondary);">${f.description || ''}</p>
             </div>
        </div>
    `).join('');
}

window.showWhyUsModal = (feature = null) => {
    featureModal.style.display = 'flex';
    if (feature) {
        featureModalTitle.textContent = 'Edit Feature';
        editSnapshot = JSON.parse(JSON.stringify(feature)); // Snapshot
        document.getElementById('featureId').value = feature.id;
        document.getElementById('featureTitle').value = feature.title;
        document.getElementById('featureDescription').value = feature.description || '';
        document.getElementById('featureImageUrl').value = feature.image_url || '';
        document.getElementById('featureOrder').value = feature.order_index;
    } else {
        featureModalTitle.textContent = 'Add Feature';
        editSnapshot = null; // New
        featureForm.reset();
        document.getElementById('featureId').value = '';
    }
};

window.closeFeatureModal = () => {
    featureModal.style.display = 'none';
};

window.editWhyUsFeature = async (id) => {
    try {
        const { data, error } = await supabase.from('why_us_features').select('*').eq('id', id).single();
        if (error) throw error;
        showWhyUsModal(data);
    } catch (e) {
        showToast('Error fetching feature: ' + e.message, 'error');
    }
};

window.deleteWhyUsFeature = async (id) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
        const { error } = await supabase.from('why_us_features').delete().eq('id', id);
        if (error) throw error;
        fetchWhyUsFeatures();
    } catch (e) {
        showToast('Error deleting feature: ' + e.message, 'error');
    }
};

if (featureForm) {
    featureForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('featureId').value;
        const featureData = {
            title: document.getElementById('featureTitle').value,
            description: document.getElementById('featureDescription').value,
            image_url: document.getElementById('featureImageUrl').value,
            order_index: parseInt(document.getElementById('featureOrder').value) || 0
        };

        try {
            if (id) {
                const { error } = await supabase.from('why_us_features').update(featureData).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('why_us_features').insert([featureData]);
                if (error) throw error;
            }
            closeFeatureModal();
            fetchWhyUsFeatures();

            let toastMsg = 'Feature saved!';
            if (id) {
                const changes = getChanges(editSnapshot, featureData);
                toastMsg = `Updated: ${changes.join(', ')}`;
            } else {
                toastMsg = 'Created New Feature';
            }
            showToast(toastMsg, 'success');
        } catch (e) {
            showToast('Error saving feature: ' + e.message, 'error');
        }
    });
}

// ----------------------------------------------------
// WEBSITE SECTIONS MANAGEMENT
// Uses dedicated 'website_sections' table
// ALL DEFAULTS ARE TRUE (ON)
// ----------------------------------------------------

async function fetchSectionSettings() {
    try {
        const { data, error } = await supabase.from('website_sections').select('*').single();
        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            // Hero Section
            editSnapshot = JSON.parse(JSON.stringify(data)); // Snapshot
            const heroToggle = document.getElementById('secShowHero');
            if (heroToggle) heroToggle.checked = data.show_hero_section !== false;

            // Product Carousel
            const tickerToggle = document.getElementById('secShowTicker');
            if (tickerToggle) tickerToggle.checked = data.show_product_carousel !== false;

            // Our Collections
            const collectionsToggle = document.getElementById('secShowCollections');
            if (collectionsToggle) collectionsToggle.checked = data.show_collections !== false;

            // Quick Commerce Layout
            const quickLayoutToggle = document.getElementById('secShowQuickLayout');
            if (quickLayoutToggle) quickLayoutToggle.checked = data.show_quick_layout !== false;

            // Testimonials
            const testimonialsToggle = document.getElementById('secShowTestimonials');
            if (testimonialsToggle) testimonialsToggle.checked = data.show_testimonials !== false;

            // Why Us
            const whyUsToggle = document.getElementById('secShowWhyUs');
            if (whyUsToggle) whyUsToggle.checked = data.show_why_us !== false;

            // Get In Touch (Contact Form)
            const contactToggle = document.getElementById('secShowContact');
            if (contactToggle) contactToggle.checked = data.show_contact_form !== false;

            // Footer
            const footerToggle = document.getElementById('secShowFooter');
            if (footerToggle) footerToggle.checked = data.show_footer !== false;
        } else {
            // No data found - set all toggles to ON (default) with null checks
            const heroEl = document.getElementById('secShowHero');
            const tickerEl = document.getElementById('secShowTicker');
            const collectionsEl = document.getElementById('secShowCollections');
            const quickLayoutEl = document.getElementById('secShowQuickLayout');
            const testimonialsEl = document.getElementById('secShowTestimonials');
            const whyUsEl = document.getElementById('secShowWhyUs');
            const contactEl = document.getElementById('secShowContact');
            const footerEl = document.getElementById('secShowFooter');

            if (heroEl) heroEl.checked = true;
            if (tickerEl) tickerEl.checked = true;
            if (collectionsEl) collectionsEl.checked = true;
            if (quickLayoutEl) quickLayoutEl.checked = true;
            if (testimonialsEl) testimonialsEl.checked = true;
            if (whyUsEl) whyUsEl.checked = true;
            if (contactEl) contactEl.checked = true;
            if (footerEl) footerEl.checked = true;
        }
    } catch (e) {
        console.error('Section settings fetch error:', e);
    }
}

// Cancel section changes - revert to original values
window.cancelSectionChanges = function () {
    if (!editSnapshot) {
        showToast('No changes to cancel', 'info');
        return;
    }

    // Map of toggle IDs to their corresponding data keys
    const toggleMap = {
        'secShowHero': 'show_hero_section',
        'secShowTicker': 'show_product_carousel',
        'secShowCollections': 'show_collections',
        'secShowQuickLayout': 'show_quick_layout',
        'secShowTestimonials': 'show_testimonials',
        'secShowWhyUs': 'show_why_us',
        'secShowContact': 'show_contact_form',
        'secShowFooter': 'show_footer'
    };

    // Revert each toggle to its original value
    for (const [toggleId, dataKey] of Object.entries(toggleMap)) {
        const toggle = document.getElementById(toggleId);
        if (toggle && editSnapshot.hasOwnProperty(dataKey)) {
            toggle.checked = editSnapshot[dataKey] !== false;
        }
    }

    showToast('Changes cancelled', 'info');
};

window.saveSectionSettings = async function () {
    const btn = document.querySelector('.floating-actions .fab-save');
    const oldHtml = btn ? btn.innerHTML : '<i class="fas fa-save"></i><span>Save</span>';

    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
        btn.disabled = true;
    }

    // Map section data keys to toggle element IDs for highlighting
    const fieldToToggleMap = {
        'show_hero_section': 'secShowHero',
        'show_product_carousel': 'secShowTicker',
        'show_collections': 'secShowCollections',
        'show_quick_layout': 'secShowQuickLayout',
        'show_testimonials': 'secShowTestimonials',
        'show_why_us': 'secShowWhyUs',
        'show_contact_form': 'secShowContact',
        'show_footer': 'secShowFooter'
    };

    // All defaults are TRUE
    const sectionData = {
        show_hero_section: document.getElementById('secShowHero')?.checked ?? true,
        show_product_carousel: document.getElementById('secShowTicker')?.checked ?? true,
        show_collections: document.getElementById('secShowCollections')?.checked ?? true,
        show_quick_layout: document.getElementById('secShowQuickLayout')?.checked ?? true,
        show_testimonials: document.getElementById('secShowTestimonials')?.checked ?? true,
        show_why_us: document.getElementById('secShowWhyUs')?.checked ?? true,
        show_contact_form: document.getElementById('secShowContact')?.checked ?? true,
        show_footer: document.getElementById('secShowFooter')?.checked ?? true
    };

    try {
        // Check if section settings exist
        const { data } = await supabase.from('website_sections').select('id').single();

        if (data) {
            const { error } = await supabase.from('website_sections').update(sectionData).eq('id', data.id);
            if (error) throw error;

            // Get list of changed fields
            const changedFields = [];
            if (editSnapshot) {
                for (const key in sectionData) {
                    if (!isLooseEqual(editSnapshot[key], sectionData[key])) {
                        changedFields.push(key);
                    }
                }
            }

            // Highlight the changed toggle cards
            changedFields.forEach(field => {
                const toggleId = fieldToToggleMap[field];
                if (toggleId) {
                    const toggleEl = document.getElementById(toggleId);
                    if (toggleEl) {
                        // Find the parent section-toggle-card
                        const card = toggleEl.closest('.section-toggle-card');
                        if (card) {
                            card.classList.add('updated');
                            // Remove the class after animation completes
                            setTimeout(() => card.classList.remove('updated'), 2000);
                        }
                    }
                }
            });

            // Show toast with changes
            if (changedFields.length > 0) {
                const labels = changedFields.map(f =>
                    f.replace(/^show_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                );
                showToast(`Updated: ${labels.join(', ')}`, 'success');
            } else {
                showToast('Data already matches your input', 'info');
            }
        } else {
            const { error } = await supabase.from('website_sections').insert([sectionData]);
            if (error) throw error;
            showToast('Section settings created!', 'success');
        }

        // Update snapshot for the next comparison
        editSnapshot = JSON.parse(JSON.stringify(sectionData));

    } catch (e) {
        console.error('Error saving section settings:', e);
        showToast('Error saving section settings: ' + e.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }
    }
};

// ========================================
// GLOBAL EXPORTS FOR CSV MANAGER
// ========================================
window.fetchProducts = fetchProducts;
window.fetchCategories = fetchCategories;
window.fetchTestimonials = fetchTestimonials;

// Expose state via getter to ensure freshness (primitives like currentView need this)
window.getAppState = () => ({
    currentView,
    allProducts,
    allCategories, // Ensure this variable exists in admin.js
    allTestimonials
});

// ==========================================
// CSV MANAGER SHIMS (Fallbacks if script fails)
// ==========================================
const createShim = (name) => {
    // Only shim if not already defined (though admin.js loads first so it defines them first)
    // We define them here. csv_manager.js (loading second) will overwrite them if it uses window.name = ...
    // OR if we use CsvManager pattern, we rely on these shims to proxy.
    // Let's implement Proxy Shim Pattern.
    window[name] = (...args) => {
        if (window.CsvManager && typeof window.CsvManager[name] === 'function') {
            return window.CsvManager[name](...args);
        }

        // Backward compatibility: If csv_manager.js still uses window.openCsvModal (old way)
        // Then these shims would have been overwritten. 
        // IF we are here, it means they were NOT overwritten OR we are using CsvManager pattern 
        // but CsvManager is missing.

        console.warn(`Shim: ${name} called but CSV Manager not ready.`);
        alert('CSV Manager functionality is not loaded. Please check console for errors or refresh.');
    };
};

[
    'openCsvModal',
    'closeCsvModal',
    'switchCsvTab',
    'exportProductsCsv',
    'handleCsvUpload',
    'processCsvImport',
    'selectAllCsvFields',
    'clearCsvUpload'
].forEach(createShim);
console.log('CSV Shims Initialized from admin.js');

// ==========================================
// MIGRATION TOOL: Supabase -> Cloudinary
// ==========================================
window.migrateSupabaseToCloudinary = async function () {
    if (!confirm("This will migrate images from Supabase Storage to Cloudinary. It may take some time. Continue?")) return;

    // UI Setup
    const progressDiv = document.getElementById('migrationProgress');
    const progressBar = document.getElementById('migrationBar');
    const progressText = document.getElementById('migrationStatusText');
    const progressCount = document.getElementById('migrationCount');

    if (progressDiv) progressDiv.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.innerText = 'Scanning for Supabase images...';

    try {
        // 1. Fetch images needing migration (URLs containing 'supabase')
        // We scan product_images table
        const { data: images, error } = await supabase
            .from('product_images')
            .select('id, image_url')
            .ilike('image_url', '%supabase%');

        if (error) throw error;

        if (!images || images.length === 0) {
            if (progressText) progressText.innerText = 'No Supabase images found in product_images table.';
            showToast('No Supabase images found to migrate in product_images table.', 'info');
            return;
        }

        const total = images.length;
        let migrated = 0;
        let failed = 0;

        if (progressCount) progressCount.innerText = `0/${total}`;

        // 2. Migrate each image
        for (const img of images) {
            try {
                if (progressText) progressText.innerText = `Migrating image ${migrated + failed + 1} of ${total}...`;

                // A. Download image from Supabase
                const response = await fetch(img.image_url);
                if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                const blob = await response.blob();

                // Convert to File for our upload function
                const file = new File([blob], `migrated_${img.id}.jpg`, { type: blob.type });

                // B. Upload to Cloudinary
                // This uses our NEW uploadImageToStorage which points to Cloudinary
                const newUrl = await uploadImageToStorage(file);

                // C. Update Database
                const { error: updateError } = await supabase
                    .from('product_images')
                    .update({ image_url: newUrl })
                    .eq('id', img.id);

                if (updateError) throw updateError;

                migrated++;
            } catch (e) {
                console.error('Migration failed for image:', img.id, e);
                failed++;
            }

            // Update Progress
            const pct = Math.round(((migrated + failed) / total) * 100);
            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressCount) progressCount.innerText = `${migrated + failed}/${total}`;
        }

        if (progressText) progressText.innerText = `Migration Complete! ${migrated} success, ${failed} failed.`;
        showToast(`Migration complete: ${migrated} moved to Cloudinary`, 'success');

        // Refresh grid if on the tab
        if (window.loadExistingImages) {
            const filter = document.getElementById('editImageProductFilter');
            window.loadExistingImages(filter ? filter.value : 'all');
        }

    } catch (e) {
        console.error('Migration error:', e);
        if (progressText) progressText.innerText = 'Error during migration check console.';
        showToast('Error migrating images', 'error');
    }
};
