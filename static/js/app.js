/* ============================================================
   TECH_AFFILIATE — Premium App JavaScript
   
   Features:
   - Staggered card reveal via IntersectionObserver
   - Skeleton screen transitions
   - Wishlist with optimistic UI (fixed ID comparison)
   - Toast notifications with enter/exit
   - Product modal with related products
   - Price alert workflow
   - User menu toggle
   - Hero text animation
   ============================================================ */

const App = {
    wishlist: [],
    wishlistItems: [],
    wishlistCount: 0,
    _userMenuOpen: false,

    init() {
        this.bindEvents();
        this.loadWishlist();
        this.updateWishlistCount();
        this.initStaggerAnimations();
        this.initHeroAnimation();
        this.syncHeartIcons();
    },

    /* ──────────── SYNC HEART ICONS ON LOAD ──────────── */
    syncHeartIcons() {
        // Use data-product-id attribute for reliable ID lookup
        document.querySelectorAll('[data-product-id]').forEach(btn => {
            const pid = String(btn.dataset.productId || '');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (pid && this.wishlist.includes(pid)) {
                btn.classList.add('wishlist-active');
                if (icon) icon.classList.add('filled');
            }
        });
    },

    /* ──────────── EVENT BINDING ──────────── */
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-close="wishlist"]')) {
                this.toggleWishlist();
            }
            if (e.target.closest('#filter-btn')) {
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown) dropdown.classList.toggle('hidden');
            }
            // Close filter dropdown when clicking outside
            if (!e.target.closest('#filter-btn') && !e.target.closest('#filter-dropdown')) {
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown && !dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                }
            }
            // Close user menu when clicking outside
            if (!e.target.closest('#user-menu-container')) {
                this.closeUserMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePriceModal();
                this.closeProductModal();
                this.closeUserMenu();
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown && !dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    },

    /* ──────────── USER MENU ──────────── */
    toggleUserMenu() {
        const dropdown = document.getElementById('user-menu-dropdown');
        if (!dropdown) return;
        this._userMenuOpen = !this._userMenuOpen;
        dropdown.classList.toggle('hidden', !this._userMenuOpen);
    },

    closeUserMenu() {
        const dropdown = document.getElementById('user-menu-dropdown');
        if (!dropdown || !this._userMenuOpen) return;
        dropdown.classList.add('hidden');
        this._userMenuOpen = false;
    },

    /* ──────────── STAGGER ANIMATIONS (IntersectionObserver) ──────────── */
    initStaggerAnimations() {
        const elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(el => observer.observe(el));
    },

    /* ──────────── HERO TEXT ANIMATION ──────────── */
    initHeroAnimation() {
        const heroWords = document.querySelectorAll('.hero-word');
        if (!heroWords.length) return;

        heroWords.forEach((word, i) => {
            word.style.animationDelay = `${0.15 + i * 0.12}s`;
            word.classList.add('hero-word--animate');
        });

        // Rotating subtitle phrases
        const rotator = document.getElementById('hero-rotator');
        if (!rotator) return;

        const phrases = [
            'Professional Creators',
            'Digital Innovators',
            'Tech Enthusiasts',
            'Precision Engineers'
        ];
        let idx = 0;

        setInterval(() => {
            rotator.classList.add('hero-rotator--exit');
            setTimeout(() => {
                idx = (idx + 1) % phrases.length;
                rotator.textContent = phrases[idx];
                rotator.classList.remove('hero-rotator--exit');
                rotator.classList.add('hero-rotator--enter');
                setTimeout(() => rotator.classList.remove('hero-rotator--enter'), 400);
            }, 300);
        }, 3000);

        // Randomize 3D shape positions
        const shapes = document.querySelectorAll('.hero-3d-shape');
        const randomizePositions = () => {
            shapes.forEach(shape => {
                const randomTop = Math.random() * 60 + 10; // 10% to 70%
                const randomLeft = Math.random() * 80 + 5; // 5% to 85%
                shape.style.top = `${randomTop}%`;
                shape.style.left = `${randomLeft}%`;
            });
        };
        randomizePositions();
        // Animate positions every 15 seconds
        setInterval(randomizePositions, 15000);
    },

    /* ──────────── PRICE MODAL ──────────── */
    openPriceModal(productId, productName, currentPrice) {
        if (!window.APP_USER) {
            window.location.href = '/login';
            return;
        }

        const modal = document.getElementById('price-alert-modal');
        if (!modal) return;

        const titleEl = modal.querySelector('[data-modal-title]');
        const priceEl = modal.querySelector('[data-current-price]');
        const emailEl = document.getElementById('alert-email');

        if (titleEl) {
            titleEl.textContent = productName || 'Set Price Alert';
            titleEl.dataset.productId = productId || '';
        }
        if (priceEl) priceEl.textContent = currentPrice ? `$${parseFloat(currentPrice).toFixed(2)}` : '$0.00';
        
        // Auto-fill email for logged-in users
        if (emailEl && window.APP_USER && window.APP_USER.email) {
            emailEl.value = window.APP_USER.email;
            emailEl.readOnly = true;
            emailEl.classList.add('bg-white/[0.02]', 'cursor-not-allowed');
            emailEl.placeholder = 'Auto-filled from your account';
        } else if (emailEl) {
            emailEl.readOnly = false;
            emailEl.classList.remove('bg-white/[0.02]', 'cursor-not-allowed');
            emailEl.placeholder = 'name@example.com';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    },

    closePriceModal() {
        const modal = document.getElementById('price-alert-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    },

    /* ──────────── PRODUCT DETAIL MODAL ──────────── */
    openProductModal(product, allProducts) {
        const modal = document.getElementById('product-detail-modal');
        if (!modal) return;

        document.getElementById('modal-product-image').src = product.image;
        document.getElementById('modal-product-image').alt = product.name;
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-product-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
        document.getElementById('modal-product-json').textContent = JSON.stringify(product);

        // Anchoring — original price + discount
        const originalPriceEl = document.getElementById('modal-original-price');
        const discountBadgeEl = document.getElementById('modal-discount-badge');
        if (product.original_price && product.original_price > product.price) {
            originalPriceEl.textContent = `$${parseFloat(product.original_price).toFixed(2)}`;
            originalPriceEl.style.display = 'inline';
            const pct = Math.round((1 - product.price / product.original_price) * 100);
            discountBadgeEl.textContent = `Save ${pct}%`;
            discountBadgeEl.style.display = 'inline-flex';
        } else {
            originalPriceEl.style.display = 'none';
            discountBadgeEl.style.display = 'none';
        }

        // Stock
        const stockBadge = document.getElementById('modal-stock-badge');
        if (product.stock > 0) {
            stockBadge.textContent = 'In Stock';
            stockBadge.className = 'badge badge-success';
        } else {
            stockBadge.textContent = 'Out of Stock';
            stockBadge.className = 'badge badge-error';
        }

        // Features
        const featuresEl = document.getElementById('modal-features');
        if (product.features && product.features.length > 0) {
            featuresEl.innerHTML = `
                <h3 class="font-headline-md text-base mb-3 text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-violet-400 text-[18px]">verified</span>Key Features
                </h3>
                <ul class="space-y-2">
                    ${product.features.map(f => `
                        <li class="flex items-start gap-2 text-[#a0a8c4] text-sm">
                            <span class="material-symbols-outlined text-violet-400 text-[16px] mt-0.5 filled">check_circle</span>
                            <span>${f}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            featuresEl.innerHTML = '';
        }

        // Affiliate link
        const affiliateLink = document.getElementById('modal-affiliate-link');
        if (product.affiliate_url) {
            affiliateLink.href = product.affiliate_url;
            affiliateLink.style.display = 'flex';
        } else {
            affiliateLink.style.display = 'none';
        }

        // Related products
        const related = allProducts
            .filter(p => p.category === product.category && String(p.id) !== String(product.id))
            .slice(0, 3);
        const relatedGrid = document.getElementById('related-products-grid');
        if (related.length > 0) {
            relatedGrid.innerHTML = related.map(p => `
                <div class="glass-card rounded-xl overflow-hidden group border border-white/[0.06] hover:border-violet-500/40 transition-all cursor-pointer" onclick="App.openProductModal(${JSON.stringify(p).replace(/"/g, '&quot;')}, ${JSON.stringify(allProducts).replace(/"/g, '&quot;')})">
                    <div class="relative aspect-[16/10] overflow-hidden">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${p.image}" alt="${p.name}" loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent opacity-60"></div>
                    </div>
                    <div class="p-4">
                        <h4 class="font-headline-md text-sm text-white mb-1 truncate">${p.name}</h4>
                        <div class="price-anchor">
                            ${p.original_price && p.original_price > p.price ? `<span class="price-anchor__original text-xs">$${parseFloat(p.original_price).toFixed(2)}</span>` : ''}
                            <span class="price-anchor__current text-lg font-headline-md">$${parseFloat(p.price).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            relatedGrid.innerHTML = '<p class="text-[#636b88] col-span-full text-center text-sm">No related products found.</p>';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    },

    closeProductModal() {
        const modal = document.getElementById('product-detail-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    },

    openPriceAlertFromModal() {
        const json = document.getElementById('modal-product-json').textContent;
        const product = JSON.parse(json);
        this.openPriceModal(product.id, product.name, product.price);
    },

    /* ──────────── PRICE ALERT SUBMISSION ──────────── */
    async submitPriceAlert() {
        const modal = document.getElementById('price-alert-modal');
        if (!modal) return;

        const titleEl = modal.querySelector('[data-modal-title]');
        const productId = titleEl?.dataset?.productId || '';
        const productName = titleEl?.textContent || '';
        const email = document.getElementById('alert-email')?.value || '';
        const desiredPrice = parseFloat(document.getElementById('alert-price')?.value || '');
        const currentPriceText = modal.querySelector('[data-current-price]')?.textContent || '$0.00';
        const currentPrice = parseFloat(currentPriceText.replace('$', ''));

        this.showToast('Sending…', 'info');

        try {
            const res = await fetch('/api/price-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, product_name: productName, email, desired_price: desiredPrice, current_price: currentPrice }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                this.showToast(`Failed: ${payload.error || 'Unable to save alert'}`, 'error');
                return;
            }

            this.showToast('Alert set! We\'ll notify you.', 'success');
            this.closePriceModal();
        } catch (err) {
            this.showToast('Network error — try again.', 'error');
        }
    },

    /* ──────────── WISHLIST (Fixed: string ID comparison) ──────────── */
    loadWishlist() {
        try {
            const stored = localStorage.getItem('ta_wishlist');
            if (stored) {
                this.wishlistItems = JSON.parse(stored);
                // Normalize IDs to strings for consistent comparison
                this.wishlist = this.wishlistItems.map(i => String(i.id));
                this.wishlistCount = this.wishlistItems.length;
            }
        } catch (e) { /* ignore */ }
    },

    saveWishlist() {
        try { localStorage.setItem('ta_wishlist', JSON.stringify(this.wishlistItems)); } catch (e) { /* ignore */ }
    },

    addToWishlist(product) {
        const pid = String(product.id);
        if (this.wishlist.includes(pid)) {
            // Toggle off — remove if already in wishlist
            this.removeFromWishlist(pid);
            return;
        }
        this.wishlist.push(pid);
        this.wishlistItems.push(product);
        this.wishlistCount++;
        this.updateWishlistCount();
        this.updateWishlistDrawer();
        this.saveWishlist();
        this._setHeartState(pid, true);
        this.showToast(`Saved ${product.name}!`, 'success');
    },

    removeFromWishlist(productId) {
        const pid = String(productId);
        const idx = this.wishlist.indexOf(pid);
        if (idx > -1) {
            this.wishlist.splice(idx, 1);
            const itemIdx = this.wishlistItems.findIndex(i => String(i.id) === pid);
            if (itemIdx > -1) this.wishlistItems.splice(itemIdx, 1);
            this.wishlistCount--;
            this.updateWishlistCount();
            this.updateWishlistDrawer();
            this.saveWishlist();
            this._setHeartState(pid, false);
            this.showToast('Removed from wishlist', 'info');
        }
    },

_setHeartState(pid, active) {
        document.querySelectorAll(`[data-product-id="${pid}"]`).forEach(btn => {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (active) {
                btn.classList.add('wishlist-active');
                if (icon) icon.classList.add('filled');
            } else {
                btn.classList.remove('wishlist-active');
                if (icon) icon.classList.remove('filled');
    },

    isInWishlist(productId) {
        return this.wishlist.includes(String(productId));
    },

    updateWishlistCount() {
        const countEl = document.querySelector('[data-wishlist-count]');
        if (countEl) {
            countEl.textContent = this.wishlistCount;
            countEl.style.display = this.wishlistCount > 0 ? 'flex' : 'none';
        }
    },

    updateWishlistDrawer() {
        const drawer = document.getElementById('wishlist-items');
        if (!drawer) return;

        if (this.wishlistItems.length === 0) {
            drawer.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined empty-state__icon">favorite_border</span>
                    <p class="empty-state__title">Nothing saved yet</p>
                    <p class="empty-state__text">Tap the heart on any product to save it here.</p>
                    <button onclick="App.toggleWishlist()" class="btn-ghost btn-premium px-5 py-2.5 rounded-xl text-sm font-medium">Browse products</button>
                </div>
            `;
            return;
        }

        drawer.innerHTML = this.wishlistItems.map(item => `
            <div class="flex gap-3 p-3 glass-card rounded-xl animate-fade-in" data-wishlist-item="${item.id}">
                <img src="${item.image}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="${item.name}" loading="lazy">
                <div class="flex-1 min-w-0">
                    <h4 class="font-headline-md text-white text-sm truncate">${item.name}</h4>
                    <p class="text-violet-400 font-bold text-sm">$${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <button onclick="App.removeFromWishlist('${item.id}')" class="w-9 h-9 flex items-center justify-center rounded-lg text-[#636b88] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0" aria-label="Remove">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        `).join('');
    },

    toggleWishlist() {
        const drawer = document.getElementById('wishlist-drawer');
        if (!drawer) return;
        drawer.classList.toggle('hidden');
        document.body.style.overflow = drawer.classList.contains('hidden') ? '' : 'hidden';
    },

    /* ──────────── SEARCH & FILTER ──────────── */
    toggleSearch() {
        const searchPanel = document.getElementById('search-panel');
        if (!searchPanel) return;
        searchPanel.classList.toggle('hidden');
        if (!searchPanel.classList.contains('hidden')) {
            const input = searchPanel.querySelector('input');
            if (input) input.focus();
        }
    },

    search(query) {
        query = query.toLowerCase().trim();
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        const cards = grid.querySelectorAll('.product-card');
        let found = 0;
        cards.forEach(card => {
            const name = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
            const match = query === '' || name.includes(query) || desc.includes(query);
            card.style.display = match ? '' : 'none';
            if (match) found++;
        });
    },

    filterCategory(category) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach(card => {
            if (category === 'all') { card.style.display = ''; return; }
            card.style.display = (card.dataset.category || '') === category ? '' : 'none';
        });
        // Close dropdown
        const dropdown = document.getElementById('filter-dropdown');
        if (dropdown) dropdown.classList.add('hidden');

        // Update hero subtitle to match category — preserve the rotator span
        const heroSubtitle = document.getElementById('hero-subtitle');
        if (heroSubtitle) {
            const subtitles = {
                'all':       'Curated high-performance hardware for <span id="hero-rotator" class="text-violet-300 font-semibold">Professional Creators</span>. Precision engineering meets boutique aesthetics.',
                'audio':     'Premium headphones and audio gear for <span id="hero-rotator" class="text-violet-300 font-semibold">Studio Professionals</span>. Engineered for pristine sound.',
                'laptop':    'Ultra-thin powerhouses built for <span id="hero-rotator" class="text-violet-300 font-semibold">Creative Professionals</span>. Uncompromising performance.',
                'accessory': 'Essential peripherals for <span id="hero-rotator" class="text-violet-300 font-semibold">Premium Workspaces</span>. Complete your setup.'
            };
            heroSubtitle.innerHTML = subtitles[category] || subtitles['all'];
        }
    },

    /* ──────────── TOAST NOTIFICATIONS ──────────── */
    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 toast-container z-[200] pointer-events-none';

        const colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-violet-600' };
        const icons = { success: 'check_circle', error: 'error', info: 'info' };

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-white shadow-elevated toast-enter ${colors[type] || colors.info}`;
        toast.innerHTML = `<span class="material-symbols-outlined text-[18px] filled">${icons[type] || icons.info}</span>${message}`;

        container.appendChild(toast);
        document.body.appendChild(container);

        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-exit');
            setTimeout(() => container.remove(), 300);
        }, 2500);
    }
};

/* ──────────── BOOTSTRAP ──────────── */
document.addEventListener('DOMContentLoaded', () => App.init());

/* Global aliases for inline onclick handlers */
window.App = App;
window.openPriceModal = (id, name, price) => App.openPriceModal(id, name, price);
window.closePriceModal = () => App.closePriceModal();
window.addToWishlist = (product) => App.addToWishlist(product);
window.toggleWishlist = () => App.toggleWishlist();
window.toggleSearch = () => App.toggleSearch();
window.search = (q) => App.search(q);
window.filterCategory = (c) => App.filterCategory(c);
window.openProductModal = (p, all) => App.openProductModal(p, all);
window.closeProductModal = () => App.closeProductModal();
window.openPriceAlertFromModal = () => App.openPriceAlertFromModal();
