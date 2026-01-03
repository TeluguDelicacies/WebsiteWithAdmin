
import { supabase } from './lib/supabase.js';

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

// State
let currentUser = null;
let currentView = 'products'; // 'products' or 'testimonials'

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
        fetchTestimonials();

    } else if (view === 'categories') {
        if (categoriesTableContainer) categoriesTableContainer.style.display = 'block';
        activeStyle(viewCategoriesBtn);

        if (addBtn) {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = 'Add Category';
        }
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
        catModalTitle.textContent = 'Add Category';
        document.getElementById('catVisible').checked = true; // Default visible
    }
}
window.closeCategoryModal = () => { categoryModal.style.display = 'none'; }

async function loadCategoryData(id) {
    const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
    if (cat) {
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
    console.log('Populating Smart Filter...');
    const dropdown = document.getElementById('filterDropdown');
    if (!dropdown) {
        console.error('CRITICAL: filterDropdown element NOT found in DOM');
        return;
    }

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_visible', true) // Only show visible categories? Or all? Usually all for admin.
            .order('display_order', { ascending: true });

        // Admin might want to filter by hidden categories too? Let's show all.
        // Actually, let's re-fetch WITHOUT .eq('is_visible', true) to be safe for admin.
        // Re-fetching inside render is wasteful, let's just use what we have, but previous logic showed all.
        // So removal of .eq check is correct.

        if (error) throw error;

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
            alert('Category saved.');
        } catch (err) {
            alert('Error: ' + err.message);
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

if (siteSettingsForm) {
    siteSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = siteSettingsForm.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

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
            } else {
                const { error } = await supabase.from('site_settings').insert([settingsData]);
                if (error) throw error;
            }
            alert('Settings saved!');
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            btn.textContent = oldText;
            btn.disabled = false;
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
    // Simple visual feedback on label if possible, or just use input
    const label = inputElement.previousElementSibling;
    const oldIcon = label.innerHTML;
    label.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

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
        // alert('Uploaded!'); 
    } catch (e) {
        console.error(e);
        alert('Upload failed: ' + e.message);
    } finally {
        label.innerHTML = oldIcon;
    }
}

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
let allProducts = [];

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
        await populateCategoryFilter(); // WAIT for categories to ensure dropdown is ready
        renderProductList(); // Render based on current filter state
    } catch (error) {
        console.error('Fetch error:', error);
        productList.innerHTML = `<p style="color: red; text-align: center;">Error: ${error.message}</p>`;
    }
}

function renderProductList() { // No arg needed, uses global allProducts + filter
    let displayProducts = allProducts;

    // Apply Filter
    const categoryFilter = document.getElementById('categoryFilter');
    const trendingFilter = document.getElementById('trendingFilter');

    const isCatFiltered = categoryFilter && categoryFilter.value !== 'all';
    const isTrendingFiltered = trendingFilter && trendingFilter.checked;
    const isFiltered = isCatFiltered || isTrendingFiltered; // General filter state

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

    // Sort logic for Display (Filtered or Not)
    if (isFiltered) {
        displayProducts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }

    const saveOrderBtn = document.getElementById('saveOrderBtn');
    if (saveOrderBtn) {
        // Always show button but disable if not filtered, OR just hide if not filtered.
        // User said "Did not get a save button", implies they might expect it always. 
        // But reordering only makes sense when filtered usually. 
        // Let's make it visible but disabled if not filtered, with a tooltip? 
        // Or stick to hiding but ensure it works. 
        // Let's try: Display always, but disabled if not filtered (with alert if clicked? no, simple disable).
        // actually existing logic was display: none. 
        // Let's change to: Show if isFiltered OR if sort is by display_order? 
        // For simplicity: Show if isFiltered. 
        saveOrderBtn.style.display = isFiltered ? 'inline-block' : 'none';

        // Debugging: force show to see if it exists
        // saveOrderBtn.style.display = 'inline-block'; 
    }

    // Drag hint
    const dndHint = !isFiltered ?
        '<div style="grid-column: 1/-1; text-align: center; background: #fff3cd; color: #856404; padding: 8px; font-size: 0.9rem; border-radius: 8px; margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Please select a specific category from the dropdown to enable reordering.</div>' : '';

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

        return `
        <div class="admin-product-card draggable-item" 
             draggable="${isFiltered}" 
             data-id="${product.id}"
             data-order="${product.display_order || 0}"
             ${isFiltered ? `
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragenter="handleDragEnter(event)"
             ondragleave="handleDragLeave(event)"` : ''}>
            
            <div class="card-row" onclick="toggleCardDetails('${product.id}')">
                <!-- Grip for Drag -->
                ${isFiltered ? '<div style="position: absolute; left: 5px; color: #ccc;"><i class="fas fa-grip-vertical"></i></div>' : ''}
                
                <img src="${product.showcase_image || PLACEHOLDER_IMAGE}" 
                     onerror="this.src=PLACEHOLDER_IMAGE"
                     style="${isFiltered ? 'margin-left: 15px;' : ''}">
                
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

        showToast('Order saved successfully!', 'success');
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

    if (productId) {
        modalTitle.textContent = 'Edit Product';
        loadProductData(productId);
    } else {
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
    div.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 20px; align-items: start; background: white; padding: 15px; border-radius: 12px; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);';

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

        // Nutrition Parsing
        const nutri = product.nutrition_info || {};
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

        document.getElementById('showcaseImage').value = product.showcase_image || '';

        // Handle Variants
        variantsContainer.innerHTML = ''; // Clear existing
        // Populate variants
        if (product.quantity_variants && product.quantity_variants.length > 0) {
            product.quantity_variants.forEach(variant => {
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
        showToast('Error loading product data', 'error');
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
                global_sold: globalSold
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
            showcase_image: document.getElementById('showcaseImage').value,
            is_trending: document.getElementById('productTrending').checked,
            is_visible: document.getElementById('productVisible').checked,
            quantity_variants: variants,
            slug: uniqueSlug
        };

        let error;
        if (productId) {
            // Update
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('products')
                .insert([productData]);
            error = insertError;
        }

        if (error) throw error;

        closeProductModal();
        fetchProducts();
        showToast('Product saved successfully!', 'success');

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
            showToast('Testimonial saved!', 'success');

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
IMAGE UPLOAD HANDLING
========================================
*/

const handleImageUpload = async (file, statusElementId, inputElementId) => {
    const statusEl = document.getElementById(statusElementId);
    const inputEl = document.getElementById(inputElementId);

    if (!file) return;

    // reset status
    statusEl.textContent = 'Uploading...';
    statusEl.style.color = 'var(--text-secondary)';

    try {
        // Sanitize filename to avoid weird character issues
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`; // Uploading to root of bucket for simplicity

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) throw error;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        inputEl.value = publicUrl;
        statusEl.textContent = 'Upload Complete!';
        statusEl.style.color = '#10b981'; // Success green

    } catch (error) {
        console.error('Upload Error:', error);
        statusEl.textContent = 'Error: ' + error.message;
        statusEl.style.color = 'red';
    }
};

// Event Listeners for Upload Inputs
const setupUploadListeners = () => {
    const showcaseUpload = document.getElementById('showcaseUpload');

    if (showcaseUpload) {
        showcaseUpload.addEventListener('change', (e) => {
            handleImageUpload(e.target.files[0], 'showcaseStatus', 'showcaseImage');
        });
    }
};

// Initialize listeners when script loads (or call this in your init function)
setupUploadListeners();

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
        document.getElementById('featureId').value = feature.id;
        document.getElementById('featureTitle').value = feature.title;
        document.getElementById('featureDescription').value = feature.description || '';
        document.getElementById('featureImageUrl').value = feature.image_url || '';
        document.getElementById('featureOrder').value = feature.order_index;
    } else {
        featureModalTitle.textContent = 'Add Feature';
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

window.saveSectionSettings = async function () {
    const btn = document.getElementById('saveSettingsBtn');
    const oldHtml = btn ? btn.innerHTML : 'Save Section Settings';

    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Saving...';
        btn.disabled = true;
    }

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
        } else {
            const { error } = await supabase.from('website_sections').insert([sectionData]);
            if (error) throw error;
        }
        showToast('Section settings saved successfully!', 'success');
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
