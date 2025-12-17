
import { supabase } from './lib/supabase.js';

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
const viewProductsBtn = document.getElementById('viewProductsBtn');
const viewTestimonialsBtn = document.getElementById('viewTestimonialsBtn');
const addBtnText = document.getElementById('addBtnText');

// State
let currentUser = null;
let currentView = 'products'; // 'products' or 'testimonials'

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
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
        alert('Login failed: ' + error.message);
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

    // Default view
    if (currentView === 'products') {
        fetchProducts();
    } else if (currentView === 'testimonials') {
        fetchTestimonials();
    } else if (currentView === 'categories') {
        fetchCategories();
    } else if (currentView === 'settings') {
        fetchSettings();
    }
}

window.switchView = (view) => {
    currentView = view;
    // Hide all first
    if (productList) productList.style.display = 'none';
    testimonialsTableContainer.style.display = 'none';
    categoriesTableContainer.style.display = 'none';
    settingsContainer.style.display = 'none';

    // Reset buttons
    [viewProductsBtn, viewTestimonialsBtn, viewCategoriesBtn, viewSettingsBtn].forEach(btn => {
        if (btn) {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.border = '1px solid var(--border-medium)';
        }
    });

    const activeStyle = (btn) => {
        btn.classList.add('active');
        btn.style.color = '';
        btn.style.background = '';
        btn.style.border = '';
    }

    if (view === 'products') {
        // Show product list
        if (productList) productList.style.display = 'grid';
        activeStyle(viewProductsBtn);
        addBtnText.textContent = 'Add Product';
        document.getElementById('addBtn').style.display = 'inline-block';
        // Show Filter
        const filterRow = document.getElementById('productFilterRow');
        if (filterRow) filterRow.style.display = 'flex';
        fetchProducts();
    } else if (view === 'testimonials') {
        testimonialsTableContainer.style.display = 'block';
        activeStyle(viewTestimonialsBtn);
        // Hide Filter
        const filterRow = document.getElementById('productFilterRow');
        if (filterRow) filterRow.style.display = 'none';
        addBtnText.textContent = 'Add Testimonial';
        document.getElementById('addBtn').style.display = 'inline-block';
        fetchTestimonials();
    } else if (view === 'categories') {
        categoriesTableContainer.style.display = 'block';
        activeStyle(viewCategoriesBtn);
        // Hide Filter
        const filterRow = document.getElementById('productFilterRow');
        if (filterRow) filterRow.style.display = 'none';
        addBtnText.textContent = 'Add Category';
        document.getElementById('addBtn').style.display = 'inline-block';
        fetchCategories();
    } else if (view === 'settings') {
        settingsContainer.style.display = 'block';
        activeStyle(viewSettingsBtn);
        // Hide Filter
        const filterRow = document.getElementById('productFilterRow');
        if (filterRow) filterRow.style.display = 'none';
        document.getElementById('addBtn').style.display = 'none'; // No add btn for settings
        fetchSettings();
    }
};

window.handleAddClick = () => {
    if (currentView === 'products') openProductModal();
    else if (currentView === 'testimonials') openTestimonialModal();
    else if (currentView === 'categories') openCategoryModal();
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
        categoryList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No categories found.</td></tr>';
        return;
    }

    categoryList.innerHTML = categories.map(cat => `
        <tr draggable="true" 
            data-id="${cat.id}" 
            data-type="category"
            class="draggable-row"
            style="border-bottom: 1px solid var(--border-light); transition: background 0.2s; cursor: move;"
            ondragstart="handleDragStart(event)"
            ondragover="handleDragOver(event)"
            ondrop="handleDrop(event)"
            ondragenter="handleDragEnter(event)"
            ondragleave="handleDragLeave(event)">
            <td style="padding: 15px;">
                 <div style="display: flex; align-items: center; gap: 10px;">
                     <i class="fas fa-grip-vertical" style="color: #ccc; cursor: grab;"></i>
                     <img src="${cat.image_url || PLACEHOLDER_IMAGE}" 
                         alt="${cat.title}" 
                         onerror="this.src=PLACEHOLDER_IMAGE"
                         style="width: 48px; height: 36px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border-light);">
                 </div>
            </td>
            <td style="padding: 15px; font-weight: 600;">${cat.title}</td>
            <td style="padding: 15px;">${cat.slug}</td>
            <td style="padding: 15px;">${cat.display_order}</td>
            <td style="padding: 15px; text-align: right;">
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="editCategory('${cat.id}')" class="nav-btn" style="padding: 8px;" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCategory('${cat.id}')" class="nav-btn" style="padding: 8px; color: var(--color-error);" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
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
    }
}
window.closeCategoryModal = () => { categoryModal.style.display = 'none'; }

async function loadCategoryData(id) {
    const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
    if (cat) {
        document.getElementById('catId').value = cat.id;
        document.getElementById('catTitle').value = cat.title;
        document.getElementById('catSlug').value = cat.slug;
        document.getElementById('catTelugu').value = cat.telugu_title || '';
        document.getElementById('catDescription').value = cat.description || '';
        document.getElementById('catOrder').value = cat.display_order || 0;
        document.getElementById('catImageUrl').value = cat.image_url || '';
    }
}

// Category Filter Logic
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
    categoryFilter.addEventListener('change', () => renderProductList());
}

async function populateCategoryFilter() {
    // Debug log
    console.log('Populating Category Filter...');

    // Allow re-population if empty, but prevent duplicates if already has options
    if (categoryFilter.options.length > 1) {
        console.log('Filter already populated.');
        return;
    }

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        if (categories) {
            console.log('Categories found for filter:', categories.length);
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.slug; // Value is slug
                option.textContent = cat.title;
                categoryFilter.appendChild(option);
            });
        }
    } catch (e) {
        console.error('Error populating filter:', e);
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
            slug: document.getElementById('catSlug').value,
            telugu_title: document.getElementById('catTelugu').value,
            description: document.getElementById('catDescription').value,
            display_order: parseInt(document.getElementById('catOrder').value || 0),
            image_url: document.getElementById('catImageUrl').value
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
            document.getElementById('setProductPlaceholder').value = data.product_placeholder_url || '';
            document.getElementById('setShowTicker').checked = data.show_product_ticker !== false; // Default true
            document.getElementById('setShowQuickLayout').checked = data.show_quick_layout || false; // Default false
            document.getElementById('setShowMrp').checked = data.show_mrp !== false; // Default true
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
            fav_icon_url: document.getElementById('setFaviconUrl').value,
            hero_background_url: document.getElementById('setHeroBgUrl').value,
            product_placeholder_url: document.getElementById('setProductPlaceholder').value,
            hero_background_url: document.getElementById('setHeroBgUrl').value,
            product_placeholder_url: document.getElementById('setProductPlaceholder').value,
            product_placeholder_url: document.getElementById('setProductPlaceholder').value,
            show_product_ticker: document.getElementById('setShowTicker').checked,
            show_quick_layout: document.getElementById('setShowQuickLayout').checked,
            show_mrp: document.getElementById('setShowMrp').checked
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
        populateCategoryFilter(); // Ensure filter is ready
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
    const isFiltered = categoryFilter && categoryFilter.value !== 'all';

    if (isFiltered) {
        displayProducts = allProducts.filter(p => p.product_category === categoryFilter.value);
    }

    if (!displayProducts || displayProducts.length === 0) {
        productList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;">No products found.</div>';
        return;
    }

    // Sort logic for Display (Filtered or Not)
    if (isFiltered) {
        displayProducts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
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
                    ${v.mrp ? `<div class="v-mrp">₹${v.mrp}</div>` : ''}
                    <div class="v-price">₹${v.price}</div>
                </div>
            `).join('');

            // Fill empty slots if less than 3 so grid stays aligned
            for (let i = variants.length; i < 3; i++) {
                variantsHtml += `<div class="mini-variant" style="opacity: 0.3;">-</div>`;
            }
        } else {
            variantsHtml = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); font-size: 0.8rem;">No variants</div>`;
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
                    <h3>${product.product_name}</h3>
                    <div class="tagline">${product.product_tagline || ''}</div>
                    <span class="category-badge">${product.product_category.replace(/-/g, ' ')}</span>
                </div>

                <div class="row-variants">
                    ${variantsHtml}
                </div>

                <div style="text-align: center; font-weight: bold; color: var(--text-secondary);">
                    ${product.display_order || 0}
                </div>

                <div class="row-actions" onclick="event.stopPropagation()">
                    <button onclick="editProduct('${product.id}')" class="nav-btn btn-sm" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="nav-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);" title="Delete">
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
    dragSrcEl = e.target.closest('.draggable-item');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', dragSrcEl.innerHTML);
    dragSrcEl.classList.add('dragging');
    dragSrcEl.style.opacity = '0.4';
};

window.handleDragOver = (e) => {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.draggable-item');
    if (target && target !== dragSrcEl) {
        target.classList.add('over');
    }
    return false;
};

window.handleDragEnter = (e) => {
    e.currentTarget.style.background = '#f0f9ff';
};

window.handleDragLeave = (e) => {
    const target = e.target.closest('.draggable-item');
    if (target) {
        target.classList.remove('over');
    }
};


window.handleDrop = (e) => {
    e.stopPropagation(); // Standard stop propagation

    const dragSrcEl = document.querySelector('.draggable-item.dragging');
    const dropTarget = e.target.closest('.draggable-item');

    if (dragSrcEl && dropTarget && dragSrcEl !== dropTarget) {
        // Swap DOM elements
        const container = dragSrcEl.parentNode;
        const allItems = Array.from(container.children);
        const srcIndex = allItems.indexOf(dragSrcEl);
        const targetIndex = allItems.indexOf(dropTarget);

        if (srcIndex < targetIndex) {
            dropTarget.after(dragSrcEl);
        } else {
            dropTarget.before(dragSrcEl);
        }

        const type = dragSrcEl.getAttribute('data-type');
        updateOrderFromDom(type, container);
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

async function updateOrderFromDom(type, container) {
    if (!container) return;

    const items = Array.from(container.children).filter(el => el.classList.contains('draggable-item') || el.classList.contains('draggable-row'));
    const updates = [];

    // Show visual feedback
    const addBtnText = document.getElementById('addBtnText');
    let originalBtnText = '';
    if (addBtnText) {
        originalBtnText = addBtnText.textContent;
        addBtnText.textContent = "Saving Order...";
    }


    // Determine Table Name and Local Update Logic
    let tableName = 'products'; // Default
    if (type === 'category') tableName = 'categories';
    else if (type === 'testimonial') tableName = 'testimonials';

    items.forEach((item, index) => {
        const id = item.getAttribute('data-id');
        const newOrder = index + 1; // 1-based index

        // update visual order cell if exists
        // Product has .order-cell. Category has it as 4th cell.
        if (type === 'product') {
            item.setAttribute('data-order', newOrder); // Update data-order attribute
        } else if (type === 'category') {
            // 4th cell is display_order
            const cells = item.querySelectorAll('td');
            if (cells[3]) cells[3].textContent = newOrder;
        }
        // Testimonials currently don't show order, so nothing to update visually in table

        updates.push({
            id: id,
            display_order: newOrder
        });
    });

    // Batch update to Supabase
    try {
        const promises = updates.map(u =>
            supabase.from(tableName).update({ display_order: u.display_order }).eq('id', u.id)
        );

        await Promise.all(promises);

        // Update local state if needed (mainly for Products which has a global store)
        if (type === 'product' && typeof allProducts !== 'undefined') {
            updates.forEach(u => {
                const p = allProducts.find(prod => prod.id === u.id);
                if (p) p.display_order = u.display_order;
            });
        }

    } catch (error) {
        console.error('Error saving order:', error);
        alert('Failed to save new order.');
    } finally {
        addBtnText.textContent = originalBtnText;
    }
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
        testimonialList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No testimonials found.</td></tr>';
        return;
    }

    testimonialList.innerHTML = testimonials.map(t => `
        <tr draggable="true"
            data-id="${t.id}"
            data-type="testimonial"
            class="draggable-row"
            style="border-bottom: 1px solid var(--border-light); transition: background 0.2s; cursor: move;"
            ondragstart="handleDragStart(event)"
            ondragover="handleDragOver(event)"
            ondrop="handleDrop(event)"
            ondragenter="handleDragEnter(event)"
            ondragleave="handleDragLeave(event)">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-grip-vertical" style="color: #ccc; cursor: grab;"></i>
                    <span style="font-weight: 600;">${t.name}</span>
                </div>
            </td>
            <td style="padding: 15px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.message}</td>
            <td style="padding: 15px;">${t.location || '-'}</td>
            <td style="padding: 15px;">${'★'.repeat(t.rating)}</td>
            <td style="padding: 15px; text-align: right;">
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="editTestimonial('${t.id}')" class="nav-btn" style="padding: 8px; font-size: 0.9rem;" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTestimonial('${t.id}')" class="nav-btn" style="padding: 8px; font-size: 0.9rem; color: var(--color-error); border-color: var(--color-error);" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
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

// ... (Testimonial functions unchanged) ...

// Helper to add variant row
window.addVariantRow = (data = null) => {
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: var(--bg-secondary); padding: 10px; border-radius: 8px;';

    div.innerHTML = `
        <div style="flex: 1;">
            <label style="font-size: 0.8rem; margin-bottom: 2px; display: block;">Quantity/Size</label>
            <input type="text" class="variant-qty form-input" placeholder="e.g. 250g" value="${data ? data.quantity : ''}" required>
        </div>
        <div style="flex: 1;">
            <label style="font-size: 0.8rem; margin-bottom: 2px; display: block;">MRP (₹)</label>
            <input type="number" class="variant-mrp form-input" placeholder="MRP" value="${data ? data.mrp || '' : ''}" required>
        </div>
        <div style="flex: 1;">
            <label style="font-size: 0.8rem; margin-bottom: 2px; display: block;">Selling Price (₹)</label>
            <input type="number" class="variant-price form-input" placeholder="Price" value="${data ? data.price : ''}" required>
        </div>
        <div style="flex: 1;">
            <label style="font-size: 0.8rem; margin-bottom: 2px; display: block;">Stock</label>
            <input type="number" class="variant-stock form-input" placeholder="Qty" value="${data ? data.stock || 0 : 0}" required>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="nav-btn" style="color: var(--color-error); margin-top: 15px;">
            <i class="fas fa-trash"></i>
        </button>
    `;

    variantsContainer.appendChild(div);
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
        document.getElementById('nutriDetails').value = nutri.details || '';
        document.getElementById('nutriCalories').value = nutri.calories || '';
        document.getElementById('nutriProtein').value = nutri.protein || '';
        document.getElementById('nutriSatFat').value = nutri.satFat || '';
        document.getElementById('nutriFat').value = nutri.fat || '';
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

    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product data');
        closeProductModal();
    }
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

    // First check variant rows
    document.querySelectorAll('.variant-row').forEach(row => {
        const qty = row.querySelector('.variant-qty').value;
        const price = row.querySelector('.variant-price').value;
        const stock = parseInt(row.querySelector('.variant-stock').value || 0);

        if (qty && price) {
            variants.push({
                quantity: qty,
                price: parseFloat(price),
                mrp: parseFloat(row.querySelector('.variant-mrp').value || 0),
                stock: stock
            });
            calculatedTotalStock += stock;
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


    const productData = {
        product_name: document.getElementById('productName').value,
        product_name_telugu: document.getElementById('productNameTelugu').value,
        product_category: document.getElementById('productCategory').value,
        product_tagline: document.getElementById('productTagline').value,
        product_description: document.getElementById('productDescription').value,
        ingredients: document.getElementById('productIngredients').value,
        serving_suggestion: document.getElementById('productUsage').value, // Kept original ID for consistency with HTML
        nutrition_info: {
            details: document.getElementById('nutriDetails').value,
            calories: document.getElementById('nutriCalories').value,
            protein: document.getElementById('nutriProtein').value,
            satFat: document.getElementById('nutriSatFat').value,
            fat: document.getElementById('nutriFat').value,
            carbs: document.getElementById('nutriCarbs').value,
            fiber: document.getElementById('nutriFiber').value,
            sugars: document.getElementById('nutriSugars').value,
            sodium: document.getElementById('nutriSodium').value
        },
        mrp: topMrp,
        net_weight: topNetWeight,
        total_stock: calculatedTotalStock,
        showcase_image: document.getElementById('showcaseImage').value,
        // info_image: document.getElementById('showcaseImage').value, // Use same image for both
        quantity_variants: variants
    };

    try {
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
        alert('Product saved successfully!');

    } catch (error) {
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
            alert('Testimonial saved!');

        } catch (error) {
            alert('Error saving testimonial: ' + error.message);
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
