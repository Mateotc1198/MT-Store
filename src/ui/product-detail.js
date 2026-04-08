import gsap from 'gsap';
import { auth, db } from '../config/firebase-config';
import { doc, getDoc, collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
    addToCart, 
    updateCartUI, 
    initCartDrawer, 
    formatCurrency 
} from '../modules/cart-manager';

const ADMIN_EMAIL = "admin@gmail.com";
let selectedQty = 1;

// --- Init Page ---
const initProductPage = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '/';
        return;
    }

    await loadProductDetails(productId);
    await loadRelatedProducts(productId);
    initCartDrawer();
    updateCartUI();
    checkAuth();
};

// --- Load Details ---
const loadProductDetails = async (id) => {
    const container = document.getElementById('product-content');
    
    try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const product = docSnap.data();
            document.title = `${product.name} | MT STORE`;

            container.innerHTML = `
                <div class="product-detail-image">
                    <img src="${product.imageUrl}" alt="${product.name}" id="main-product-img">
                </div>
                <div class="product-detail-info">
                    <h1 class="reveal-text">${product.name}</h1>
                    <div class="detail-price reveal-text">${formatCurrency(product.price)}</div>
                    <p class="detail-desc reveal-text">${product.description || 'Este exclusivo modelo de MT STORE combina estilo y confort para los amantes de los sneakers.'}</p>
                    
                    <div class="size-selector reveal-text">
                        <h4>Selecciona tu talla (US)</h4>
                        <div class="sizes-grid">
                            ${['7', '8', '9', '10', '11', '12'].map(s => `<div class="size-box">${s}</div>`).join('')}
                        </div>
                    </div>

                    <div class="quantity-picker reveal-text">
                        <h4>Cantidad</h4>
                        <div class="qty-controls">
                            <button id="detail-minus">-</button>
                            <span id="detail-qty">1</span>
                            <button id="detail-plus">+</button>
                        </div>
                    </div>

                    <button class="add-cart-btn-large reveal-text" id="add-to-cart-large">
                        AÑADIR AL CARRITO
                    </button>
                    <div style="margin-top: 1rem; color: #888; font-size: 0.8rem;">
                        <i class="fa-solid fa-truck-fast"></i> Envío gratis a todo Colombia
                    </div>
                </div>
            `;

            const qtyDisplay = document.getElementById('detail-qty');
            document.getElementById('detail-plus').onclick = () => {
                selectedQty++;
                qtyDisplay.innerText = selectedQty;
            };

            document.getElementById('detail-minus').onclick = () => {
                if (selectedQty > 1) {
                    selectedQty--;
                    qtyDisplay.innerText = selectedQty;
                }
            };

            document.getElementById('add-to-cart-large').onclick = () => {
                addToCart({ id, ...product }, selectedQty);
            };

            document.querySelectorAll('.size-box').forEach(box => {
                box.onclick = () => {
                    document.querySelectorAll('.size-box').forEach(b => b.classList.remove('active'));
                    box.classList.add('active');
                };
            });

            gsap.from('.product-detail-image', { x: -50, opacity: 0, duration: 1, ease: 'power3.out' });
            gsap.from('.reveal-text', { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.2 });

        } else {
            container.innerHTML = '<h2>Producto no encontrado</h2>';
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        container.innerHTML = '<h2>Error al cargar el producto</h2>';
    }
};

// --- Related Products ---
const loadRelatedProducts = async (currentId) => {
    const grid = document.getElementById('related-grid');
    if (!grid) return;

    try {
        const q = query(collection(db, "productos"), limit(4), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        grid.innerHTML = '';
        querySnapshot.forEach((doc) => {
            if (doc.id !== currentId) {
                const product = doc.data();
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">${formatCurrency(product.price)}</div>
                    </div>
                    <button class="add-cart-btn" onclick="location.href='/product.html?id=${doc.id}'">VER DETALLES</button>
                `;
                grid.appendChild(card);
            }
        });
    } catch (error) {
        console.error("Error loading related products", error);
    }
};

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

        if (user) {
            const isAdmin = user.email === ADMIN_EMAIL;
            if (adminLink) adminLink.style.display = isAdmin ? 'inline-block' : 'none';
            if (userDropdown) userDropdown.style.display = '';
            if (userBtn) {
                userBtn.href = '#';
                userBtn.innerHTML = '<i class="fa-solid fa-user-check"></i>';
                userBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    userDropdown?.classList.toggle('active');
                };
            }
            document.addEventListener('click', () => {
                userDropdown?.classList.remove('active');
            });
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

initProductPage();
