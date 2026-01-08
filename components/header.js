
// Header Component - Single Source of Truth
const HeaderComponent = {
    render: function (pageType) {
        const header = document.querySelector('header');
        if (!header) return;

        // Base HTML Structure (Matches index.html "Perfect Header")
        // Note: The outer <header> tag determines styling scope (e.g. .sales-header)
        header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <!-- Logo Section -->
                <a href="index.html" class="logo-section" onclick="if('${pageType}' === 'sales') event.stopPropagation();">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                        id="headerLogo" alt="Telugu Delicacies Logo" class="logo"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="logo-fallback" style="display: none;">TD</div>
                    <div class="logo-text">
                        <h1 class="brand-name" id="header-site-title">Telugu Delicacies</h1>
                        <span id="header-site-title-telugu" class="telugu-brand"></span>
                    </div>
                </a>

                <!-- Desktop Navigation Buttons -->
                <nav class="desktop-nav" id="headerDesktopNav">
                    <!-- Injected by JS -->
                </nav>

                <!-- Mobile Action Icons (Always Visible on Mobile) -->
                <div class="mobile-actions" id="headerMobileActions">
                     <!-- Injected by JS -->
                </div>
            </div>
        </div>
        `;

        this.renderButtons(pageType);
        this.loadBranding();
    },

    renderButtons: function (pageType) {
        const desktopNav = document.getElementById('headerDesktopNav');
        const mobileActions = document.getElementById('headerMobileActions');

        // Button Templates
        const cartBtnHtml = `
            <button class="nav-btn cart-btn" id="mainCartBtn" onclick="${pageType === 'sales' ? 'window.toggleCartDrawer()' : 'window.toggleMainCartDrawer()'}" data-tooltip="View Cart" style="display:none;">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" id="mainCartCount" style="display:none;">0</span>
            </button>`;

        const sharePageBtnHtml = `
             <button class="nav-btn share-page-btn" onclick="window.shareCurrentPage()" data-tooltip="Share Page">
                <i class="fas fa-arrow-up-from-bracket"></i>
            </button>`;

        const homeBtnHtml = `
            <a href="index.html" class="nav-btn home-btn" data-tooltip="Back Home">
                <i class="fas fa-home"></i>
            </a>`;

        const shareCatalogueBtnHtml = `
            <button class="nav-btn share-catalogue-btn" onclick="window.shareCatalogue()" data-tooltip="Share Catalogue">
                <i class="fas fa-book-open"></i>
            </button>`;

        if (pageType === 'home') {
            // Desktop Config
            desktopNav.innerHTML = `
                <button class="nav-btn" id="productsBtn" onclick="document.getElementById('product-showcase').scrollIntoView({behavior: 'smooth'})" data-tooltip="Our Products">
                    <i class="fas fa-utensils"></i>
                </button>
                <button class="nav-btn" id="contactBtn" onclick="document.getElementById('contact-form').scrollIntoView({behavior: 'smooth'})" data-tooltip="Contact Us">
                    <i class="fas fa-envelope"></i>
                </button>
                ${shareCatalogueBtnHtml}
                ${sharePageBtnHtml}
                ${cartBtnHtml}
                <button class="nav-btn whatsapp-btn" id="whatsappBtn" data-tooltip="View Catalogue on WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
            `;

            // Mobile Config
            mobileActions.innerHTML = `
                ${shareCatalogueBtnHtml}
                ${cartBtnHtml}
                <button class="hamburger-btn" aria-label="Menu" onclick="window.toggleMobileMenu()">
                    <i class="fas fa-bars"></i>
                </button>
            `;
        } else if (pageType === 'sales') {
            // Sales Page: Show same buttons desktop & mobile usually, but logic separates them
            // We'll duplicate them to ensure visibility in both viewpoints if CSS hides one

            const salesButtons = `
                ${sharePageBtnHtml}
                ${cartBtnHtml}
                ${homeBtnHtml}
            `;

            desktopNav.innerHTML = salesButtons;
            mobileActions.innerHTML = salesButtons;

            // Fix IDs for sales page scripts
            setTimeout(() => {
                const cartBtns = document.querySelectorAll('#mainCartBtn');
                const cartCounts = document.querySelectorAll('#mainCartCount');

                cartBtns.forEach(btn => {
                    btn.id = 'cartBtn';
                    btn.style.display = 'flex'; // Force visible
                });
                cartCounts.forEach(span => {
                    span.id = 'cartCount';
                    span.style.display = 'flex'; // Force visible
                });
            }, 0);

        } else if (pageType === 'legal') {
            desktopNav.innerHTML = homeBtnHtml;
            mobileActions.innerHTML = homeBtnHtml;
        }
    },

    loadBranding: async function () {
        try {
            let client = window.supabase;
            if (!client && window.supabaseClient) client = window.supabaseClient;

            if (!client) {
                setTimeout(() => this.loadBranding(), 500);
                return;
            }

            const { data } = await client
                .from('site_settings')
                .select('site_title, site_title_telugu, logo_url')
                .single();

            if (data) {
                if (data.site_title) {
                    document.querySelectorAll('#header-site-title').forEach(el => el.textContent = data.site_title);
                }
                if (data.site_title_telugu) {
                    document.querySelectorAll('#header-site-title-telugu').forEach(el => el.textContent = data.site_title_telugu);
                }
                if (data.logo_url) {
                    document.querySelectorAll('#headerLogo').forEach(el => {
                        el.src = data.logo_url;
                        el.onload = () => {
                            el.style.display = 'block';
                            if (el.nextElementSibling) el.nextElementSibling.style.display = 'none';
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Header branding fetch failed:', e);
        }
    }
};

window.HeaderComponent = HeaderComponent;
