
import { supabase } from './lib/supabase.js';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const productList = document.getElementById('productList');
const testimonialList = document.getElementById('testimonialList');
const productModal = document.getElementById('productModal');
const testimonialModal = document.getElementById('testimonialModal');
const productForm = document.getElementById('productForm');
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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        // Auth listener will handle UI switch
    } catch (error) {
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

// UI Switching
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    if (currentView === 'products') {
        fetchProducts();
    } else {
        fetchTestimonials();
    }
}

window.switchView = (view) => {
    currentView = view;
    if (view === 'products') {
        productsTableContainer.style.display = 'block';
        testimonialsTableContainer.style.display = 'none';
        viewProductsBtn.classList.add('active');
        viewProductsBtn.style.color = '';
        viewProductsBtn.style.background = '';
        viewProductsBtn.style.border = '';

        viewTestimonialsBtn.classList.remove('active');
        viewTestimonialsBtn.style.background = 'transparent';
        viewTestimonialsBtn.style.color = 'var(--text-secondary)';
        viewTestimonialsBtn.style.border = '1px solid var(--border-medium)';

        addBtnText.textContent = 'Add Product';
        fetchProducts();
    } else {
        productsTableContainer.style.display = 'none';
        testimonialsTableContainer.style.display = 'block';
        viewTestimonialsBtn.classList.add('active');
        viewTestimonialsBtn.style.color = ''; // Reset to css default
        viewTestimonialsBtn.style.background = ''; // Reset
        viewTestimonialsBtn.style.border = '';

        viewProductsBtn.classList.remove('active');
        viewProductsBtn.style.background = 'transparent';
        viewProductsBtn.style.color = 'var(--text-secondary)';
        viewProductsBtn.style.border = '1px solid var(--border-medium)';

        addBtnText.textContent = 'Add Testimonial';
        fetchTestimonials();
    }
};

window.openAddModal = () => {
    if (currentView === 'products') {
        openProductModal();
    } else {
        openTestimonialModal();
    }
};

// ... [Existing Product Management Functions: fetchProducts, renderProductList] ...

// Product Management
async function fetchProducts() {
    productList.innerHTML = '<p style="text-align: center;">Loading...</p>';

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderProductList(products);
    } catch (error) {
        console.error('Fetch error:', error);
        let msg = error.message;
        if (error.message === 'Failed to fetch') {
            msg = 'Connection failed. Please check your internet connection or ensuring you are not blocking Supabase domains. (If using AdBlock, try disabling it)';
        }
        productList.innerHTML = `<p style="color: red; text-align: center;">Error: ${msg}</p>`;
    }
}

function renderProductList(products) {
    if (!products || products.length === 0) {
        productList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No products found.</td></tr>';
        return;
    }

    productList.innerHTML = products.map(product => {
        // Stock status styles
        const stockStatus = product.total_stock < 10 ? 'color: #dc2626; background: #fee2e2;' : 'color: #166534; background: #dcfce7;';

        return `
        <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s;">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${product.showcase_image || 'https://via.placeholder.com/60'}" 
                         alt="${product.product_name}" 
                         onerror="this.src='https://via.placeholder.com/60'"
                         style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-light);">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${product.product_name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${product.product_tagline || ''}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px;">
                <span style="font-size: 0.9rem; padding: 4px 10px; border-radius: 20px; background: var(--bg-secondary); border: 1px solid var(--border-medium);">
                    ${product.product_category.replace(/-/g, ' ')}
                </span>
            </td>
            <td style="padding: 15px; font-weight: 500;">
                ₹${product.mrp}
            </td>
            <td style="padding: 15px;">
                <span style="font-size: 0.85rem; padding: 4px 10px; border-radius: 6px; font-weight: 600; ${stockStatus}">
                    ${product.total_stock} units
                </span>
            </td>
            <td style="padding: 15px; text-align: right;">
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="editProduct('${product.id}')" class="nav-btn" style="padding: 8px; font-size: 0.9rem;" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="nav-btn" style="padding: 8px; font-size: 0.9rem; color: var(--color-error); border-color: var(--color-error);" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// Testimonial Management
async function fetchTestimonials() {
    testimonialList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading...</td></tr>';

    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

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
        <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s;">
            <td style="padding: 15px; font-weight: 600;">${t.name}</td>
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
window.openProductModal = (productId = null) => {
    productModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset form
    productForm.reset();
    variantsContainer.innerHTML = '';
    document.getElementById('productId').value = '';

    if (productId) {
        modalTitle.textContent = 'Edit Product';
        loadProductData(productId);
    } else {
        modalTitle.textContent = 'Add Product';
        addVariantRow(); // Add one empty variant row by default
    }
};

window.closeProductModal = () => {
    productModal.style.display = 'none';
    document.body.style.overflow = '';
};

// Modal Functions (Testimonial)
window.openTestimonialModal = (testimonialId = null) => {
    testimonialModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset form
    testimonialForm.reset();
    document.getElementById('testimonialId').value = '';

    if (testimonialId) {
        testimonialModalTitle.textContent = 'Edit Testimonial';
        loadTestimonialData(testimonialId);
    } else {
        testimonialModalTitle.textContent = 'Add Testimonial';
    }
};

window.closeTestimonialModal = () => {
    testimonialModal.style.display = 'none';
    document.body.style.overflow = '';
};

async function loadTestimonialData(id) {
    try {
        const { data: t, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('testimonialId').value = t.id;
        document.getElementById('tName').value = t.name;
        document.getElementById('tLocation').value = t.location || '';
        document.getElementById('tMessage').value = t.message;
        document.getElementById('tRating').value = t.rating || 5;
        document.getElementById('tProduct').value = t.product_name || '';

    } catch (error) {
        alert('Error loading testimonial: ' + error.message);
        closeTestimonialModal();
    }
}

// Add Variant Row
window.addVariantRow = (variant = {}) => {
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.innerHTML = `
        <input type="text" placeholder="Size (e.g. 250g)" value="${variant.quantity || ''}" class="variant-qty" oninput="updateTotalStockDisplay()">
        <input type="number" placeholder="Price" value="${variant.price || ''}" class="variant-price">
        <input type="number" placeholder="MRP" value="${variant.mrp || ''}" class="variant-mrp">
        <input type="number" placeholder="Stock Count" value="${variant.stock || 0}" class="variant-stock" oninput="updateTotalStockDisplay()">
        <button type="button" onclick="this.parentElement.remove(); updateTotalStockDisplay();" style="color: red; border: none; background: none; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    variantsContainer.appendChild(div);
};

window.updateTotalStockDisplay = () => {
    let total = 0;
    document.querySelectorAll('.variant-stock').forEach(input => {
        total += parseInt(input.value || 0);
    });
    document.getElementById('totalStock').value = total;
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
        document.getElementById('mrp').value = product.mrp || '';
        document.getElementById('netWeight').value = product.net_weight || '';
        document.getElementById('totalStock').value = product.total_stock || 0;
        document.getElementById('showcaseImage').value = product.showcase_image || '';
        // document.getElementById('infoImage').value = product.info_image || ''; // Removed

        // Populate variants
        if (product.quantity_variants && Array.isArray(product.quantity_variants)) {
            product.quantity_variants.forEach(v => addVariantRow(v));
        } else {
            addVariantRow();
        }

        // Recalculate total stock to ensure UI consistency
        updateTotalStockDisplay();

    } catch (error) {
        alert('Error loading product: ' + error.message);
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
    const variants = [];
    let calculatedTotalStock = 0;

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

    const productData = {
        product_name: document.getElementById('productName').value,
        product_name_telugu: document.getElementById('productNameTelugu').value,
        product_category: document.getElementById('productCategory').value,
        product_tagline: document.getElementById('productTagline').value,
        product_description: document.getElementById('productDescription').value,
        mrp: parseFloat(document.getElementById('mrp').value || 0),
        net_weight: document.getElementById('netWeight').value,
        total_stock: calculatedTotalStock, // Use calculated stock
        total_stock: calculatedTotalStock, // Use calculated stock
        showcase_image: document.getElementById('showcaseImage').value,
        info_image: document.getElementById('showcaseImage').value, // Use same image for both
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
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.editProduct = (id) => openProductModal(id);

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
