
import { supabase } from './lib/supabase.js';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const productList = document.getElementById('productList');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const variantsContainer = document.getElementById('variantsContainer');
const modalTitle = document.getElementById('modalTitle');

// State
let currentUser = null;

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
        if (error) throw error;
    } catch (error) {
        alert('Logout failed: ' + error.message);
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
    fetchProducts();
}

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
        productList.innerHTML = `<p style="color: red; text-align: center;">Error: ${error.message}</p>`;
    }
}

function renderProductList(products) {
    if (!products || products.length === 0) {
        productList.innerHTML = '<p style="text-align: center;">No products found.</p>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-card-admin">
            <div style="display: flex; gap: 15px; align-items: center;">
                <img src="${product.showcase_image || 'https://via.placeholder.com/60'}" alt="${product.product_name}" onerror="this.src='https://via.placeholder.com/60'">
                <div>
                    <h3 style="margin: 0;">${product.product_name}</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${product.product_category}</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="editProduct('${product.id}')" class="nav-btn btn-sm">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct('${product.id}')" class="nav-btn btn-sm" style="color: var(--color-error); border-color: var(--color-error);">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Modal Functions
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

// Add Variant Row
window.addVariantRow = (variant = {}) => {
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.innerHTML = `
        <input type="text" placeholder="Qty (e.g. 250g)" value="${variant.quantity || ''}" class="variant-qty">
        <input type="number" placeholder="Price" value="${variant.price || ''}" class="variant-price">
        <input type="number" placeholder="MRP" value="${variant.mrp || ''}" class="variant-mrp">
        <input type="number" placeholder="Stock" value="${variant.stock || 0}" class="variant-stock">
        <button type="button" onclick="this.parentElement.remove()" style="color: red; border: none; background: none; cursor: pointer;">
            <i class="fas fa-times"></i>
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
        document.getElementById('productCategory').value = product.product_category;
        document.getElementById('productTagline').value = product.product_tagline || '';
        document.getElementById('productDescription').value = product.product_description || '';
        document.getElementById('mrp').value = product.mrp || '';
        document.getElementById('netWeight').value = product.net_weight || '';
        document.getElementById('totalStock').value = product.total_stock || 0;
        document.getElementById('showcaseImage').value = product.showcase_image || '';
        document.getElementById('infoImage').value = product.info_image || '';

        // Populate variants
        if (product.quantity_variants && Array.isArray(product.quantity_variants)) {
            product.quantity_variants.forEach(v => addVariantRow(v));
        } else {
            addVariantRow();
        }

    } catch (error) {
        alert('Error loading product: ' + error.message);
        closeProductModal();
    }
}

// Form Submission
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const submitBtn = productForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    // Collect Variants
    const variants = [];
    document.querySelectorAll('.variant-row').forEach(row => {
        const qty = row.querySelector('.variant-qty').value;
        const price = row.querySelector('.variant-price').value;
        if (qty && price) {
            variants.push({
                quantity: qty,
                price: parseFloat(price),
                mrp: parseFloat(row.querySelector('.variant-mrp').value || 0),
                stock: parseInt(row.querySelector('.variant-stock').value || 0)
            });
        }
    });

    const productData = {
        product_name: document.getElementById('productName').value,
        product_category: document.getElementById('productCategory').value,
        product_tagline: document.getElementById('productTagline').value,
        product_description: document.getElementById('productDescription').value,
        mrp: parseFloat(document.getElementById('mrp').value || 0),
        net_weight: document.getElementById('netWeight').value,
        total_stock: parseInt(document.getElementById('totalStock').value || 0),
        showcase_image: document.getElementById('showcaseImage').value,
        info_image: document.getElementById('infoImage').value,
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

// Expose functions to window for onclick handlers
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.editProduct = (id) => openProductModal(id);
