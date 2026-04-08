import gsap from 'gsap';

export let cart = JSON.parse(localStorage.getItem('mt_store_cart')) || [];

export const formatCurrency = (amt) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(amt);
};

export const saveCart = () => {
    localStorage.setItem('mt_store_cart', JSON.stringify(cart));
    // Dispatch a custom event so all pages can listen and update their UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    saveCart();
};

export const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
};

export const updateQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
        }
    }
};

export const updateCartUI = () => {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartCount) return;

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.innerText = totalItems;
    
    if (totalItems > 0 && cartCount) {
        gsap.fromTo(cartCount, { scale: 1.5 }, { scale: 1, duration: 0.3 });
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-msg">Tu carrito está vacío.</p>';
        if (cartTotal) cartTotal.innerText = formatCurrency(0);
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="price">${formatCurrency(item.price)}</div>
                <div class="quantity-controls">
                    <button class="minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        `;

        itemEl.querySelector('.minus').onclick = () => updateQuantity(item.id, -1);
        itemEl.querySelector('.plus').onclick = () => updateQuantity(item.id, 1);
        itemEl.querySelector('.remove-item').onclick = () => removeFromCart(item.id);

        cartItems.appendChild(itemEl);
    });

    if (cartTotal) cartTotal.innerText = formatCurrency(total);
};

export const initCartDrawer = () => {
    const drawer = document.getElementById('cart-drawer');
    const openBtn = document.getElementById('cart-icon-btn');
    const closeBtn = document.getElementById('close-cart');
    
    if (!drawer) return;
    
    const overlay = drawer.querySelector('.cart-overlay');
    const content = drawer.querySelector('.cart-content');

    const openCart = () => {
        drawer.style.visibility = 'visible';
        gsap.to(overlay, { opacity: 1, duration: 0.5 });
        gsap.to(content, { right: 0, duration: 0.5, ease: 'power2.out' });
    };

    const closeCart = () => {
        gsap.to(overlay, { opacity: 0, duration: 0.5 });
        gsap.to(content, { 
            right: '-450px', 
            duration: 0.5, 
            ease: 'power2.in',
            onComplete: () => {
                drawer.style.visibility = 'hidden';
            }
        });
    };

    if (openBtn) openBtn.onclick = (e) => { e.preventDefault(); openCart(); };
    if (closeBtn) closeBtn.onclick = closeCart;
    if (overlay) overlay.onclick = closeCart;

    // Redirect to Checkout
    const checkoutBtn = drawer.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length > 0) {
                window.location.href = '/checkout.html';
            } else {
                alert('Añade al menos un producto para continuar.');
            }
        };
    }

    // Listen for updates from other parts of the app
    window.addEventListener('cartUpdated', updateCartUI);
};
