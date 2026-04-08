import gsap from 'gsap';
import { auth, db } from './src/config/firebase-config';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
    addToCart, 
    updateCartUI, 
    initCartDrawer, 
    formatCurrency 
} from './src/modules/cart-manager';

const ADMIN_EMAIL = "admin@gmail.com";
let currentBrand = 'all';
let currentSort = 'recent';
let searchTerm = '';
let unsubscribe = null;
let allProducts = []; // Cache full product list for client-side search

// --- GSAP Animations ---
const initAnimations = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    tl.from('#main-header', { y: -100, opacity: 0, duration: 1 });
    tl.from('.hero-badge', { width: 0, opacity: 0, duration: 0.8 }, '-=0.5');
    tl.from('.hero-title', { y: 50, opacity: 0, duration: 1 }, '-=0.8');
    tl.from('.hero-description', { x: -30, opacity: 0 }, '-=1');
    tl.from('.hero-cta', { y: 20, opacity: 0 }, '-=1');
    tl.from('.image-wrapper', { scale: 0.8, rotate: 0, opacity: 0, duration: 1.5 }, '-=1.5');

    // Floating Animation for Hero
    gsap.to('.image-wrapper', {
        y: -30,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
    });
};

// --- #11: Scroll Effects (Header + Active Nav) ---
const initScrollEffects = () => {
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
};

// --- #12: Cart Feedback Toast ---
const showCartFeedback = (productName) => {
    const existing = document.querySelector('.cart-feedback');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-feedback';
    toast.innerHTML = `<i class="fa-solid fa-cart-plus"></i> <span>${productName} añadido al carrito</span>`;
    document.body.appendChild(toast);

    gsap.to(toast, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
    setTimeout(() => {
        gsap.to(toast, { y: 100, opacity: 0, duration: 0.4, onComplete: () => toast.remove() });
    }, 2500);
};

// --- Skeleton Screens ---
const showSkeletons = (container) => {
    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-text title"></div>
            <div class="skeleton-text desc"></div>
            <div class="skeleton-text price"></div>
        `;
        container.appendChild(skeleton);
    }
};

// --- Render products from cached list ---
const renderFromCache = () => {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    let filtered = [...allProducts];

    // Filter by brand
    if (currentBrand !== 'all') {
        filtered = filtered.filter(p => p.marca === currentBrand);
    }

    // Filter by search term
    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.marca || '').toLowerCase().includes(term)
        );
    }

    // Sort
    if (currentSort === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    }

    productsGrid.innerHTML = '';

    if (filtered.length === 0) {
        productsGrid.innerHTML = '<div class="no-products" style="grid-column:1/-1; text-align:center; padding:4rem; color:#888;">No hay productos con este filtro.</div>';
        return;
    }

    filtered.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.opacity = "0";
        card.innerHTML = `
            <div class="product-badge">${product.marca || ''}</div>
            <div class="product-image">
                <img src="${product.imageUrl || '/assets/hero_sneaker.png'}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || 'Edición exclusiva para coleccionistas.'}</p>
                <div class="product-price">${formatCurrency(product.price)}</div>
            </div>
            <button class="add-cart-btn">AÑADIR AL CARRITO</button>
        `;

        card.onclick = () => { window.location.href = `/product.html?id=${product.id}`; };
        card.querySelector('.add-cart-btn').onclick = (e) => {
            e.stopPropagation();
            addToCart(product);
            showCartFeedback(product.name);
        };

        productsGrid.appendChild(card);
    });

    gsap.to('.product-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out', clearProps: "opacity,transform" });
};

// --- Product Logic (One listener) ---
const renderProducts = () => {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    showSkeletons(productsGrid);

    const productsRef = collection(db, "productos");
    const q = query(productsRef, orderBy("createdAt", "desc"));

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {
        allProducts = [];
        snapshot.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));
        renderFromCache();
    });
};

// --- Filter Events ---
const initFilters = () => {
    const pills = document.querySelectorAll('.pill');
    const sortSelect = document.getElementById('sort-price');
    const searchInput = document.querySelector('.search-bar input');

    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentBrand = pill.dataset.brand;
            renderFromCache();
        };
    });

    if (sortSelect) {
        sortSelect.onchange = (e) => {
            currentSort = e.target.value;
            renderFromCache();
        };
    }

    // Real-time search
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchTerm = e.target.value;
            renderFromCache();

            // Scroll to catalog smoothly
            if (searchTerm.trim()) {
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
};

// --- Wishlist ---
const initWishlist = () => {
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (!wishlistBtn) return;
    const wishlist = JSON.parse(localStorage.getItem('mt_store_wishlist')) || [];
    if (wishlist.length > 0) wishlistBtn.classList.add('active');

    wishlistBtn.onclick = (e) => {
        e.preventDefault();
        wishlistBtn.classList.toggle('active');
        // In the real product detail page the toggle is handled with product context
    };
};

// --- Welcome Toast ---
const showWelcomeToast = (userName, isAdmin = false) => {
    const toast = document.createElement('div');
    toast.className = 'welcome-toast';
    toast.style.borderLeft = `4px solid ${isAdmin ? 'var(--accent-color)' : '#4CAF50'}`;
    toast.innerHTML = `
        <i class="fa-solid ${isAdmin ? 'fa-user-shield' : 'fa-circle-check'}"></i>
        <span>¡Hola, ${userName}! ${isAdmin ? 'Acceso Admin activo.' : 'Bienvenido a MT STORE.'}</span>
    `;
    document.body.appendChild(toast);
    gsap.to(toast, { bottom: '30px', opacity: 1, duration: 0.8, ease: 'back.out(1.7)' });
    setTimeout(() => {
        gsap.to(toast, { bottom: '-100px', opacity: 0, duration: 0.5, onComplete: () => toast.remove() });
    }, 4000);
};

// --- Auth & User Dropdown ---
const checkAuth = () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            signOut(auth).then(() => { window.location.href = '/'; });
        };
    }

    auth.onAuthStateChanged(user => {
        const userBtn = document.getElementById('user-btn');
        const adminLink = document.getElementById('admin-link');
        const userDropdown = document.getElementById('user-dropdown');
        const urlParams = new URLSearchParams(window.location.search);

        if (user) {
            const isAdmin = user.email === ADMIN_EMAIL;
            if (adminLink) adminLink.style.display = isAdmin ? 'inline-block' : 'none';
            if (userDropdown) userDropdown.style.display = '';
            if (userBtn) {
                userBtn.href = '#'; // Prevent nav to login when logged in
                userBtn.innerHTML = '<i class="fa-solid fa-user-check"></i>';
                userBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    userDropdown?.classList.toggle('active');
                };
            }
            // Close dropdown on outside click
            document.addEventListener('click', () => {
                userDropdown?.classList.remove('active');
            });
            if (urlParams.get('login') === 'success' || urlParams.get('register') === 'success') {
                showWelcomeToast(user.displayName || user.email.split('@')[0], isAdmin);
                window.history.replaceState({}, document.title, "/");
            }
        } else {
            if (adminLink) adminLink.style.display = 'none';
            if (userDropdown) {
                userDropdown.classList.remove('active');
                userDropdown.style.display = 'none';
            }
            if (userBtn) {
                userBtn.innerHTML = '<i class="fa-regular fa-user"></i>';
                userBtn.href = '/login.html';
                userBtn.onclick = null;
            }
        }
    });
};

// --- Initialize ---
const initApp = () => {
    initAnimations();
    initScrollEffects();
    initFilters();
    renderProducts();
    checkAuth();
    initCartDrawer();
    updateCartUI();
    initWishlist();
};

window.addEventListener('DOMContentLoaded', initApp);
