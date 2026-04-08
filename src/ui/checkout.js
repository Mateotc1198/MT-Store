import { auth, db } from '../config/firebase-config';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import gsap from 'gsap';
import { formatCurrency } from '../modules/cart-manager';

let cart = JSON.parse(localStorage.getItem('mt_store_cart')) || [];

const initCheckout = () => {
    // Check if user is logged in
    auth.onAuthStateChanged(user => {
        if (!user) {
            alert('Debes iniciar sesión para realizar la compra.');
            window.location.href = '/login.html';
        }
    });

    if (cart.length === 0) {
        alert('Tu carrito está vacío. Serás redirigido a la tienda.');
        window.location.href = '/';
        return;
    }

    renderSummary();
    setupPayButton();
    animateEntry();
};

const renderSummary = () => {
    const summaryList = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('sum-subtotal');
    const totalEl = document.getElementById('sum-total');

    if (!summaryList) return;

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        `;
        summaryList.appendChild(div);
    });

    subtotalEl.innerText = formatCurrency(subtotal);
    totalEl.innerText = formatCurrency(subtotal);
};

const setupPayButton = () => {
    const payBtn = document.getElementById('pay-btn');
    const bankSelect = document.getElementById('bank-select');
    const nameInput = document.getElementById('c-name');

    payBtn.onclick = () => {
        if (!nameInput.value || !bankSelect.value) {
            alert('Por favor completa tus datos y selecciona un banco.');
            return;
        }

        simulatePayment();
    };
};

const simulatePayment = async () => {
    const payBtn = document.getElementById('pay-btn');
    payBtn.disabled = true;
    payBtn.innerText = 'PROCESANDO PAGO SEGÚRO...';

    // Save order to Firestore
    try {
        const user = auth.currentUser;
        if (user) {
            let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                items: cart,
                total: total,
                status: 'completado',
                paymentMethod: 'PSE',
                bank: document.getElementById('bank-select').value,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "pedidos"), orderData);
        }
    } catch (e) {
        console.error("Error saving order:", e);
    }

    // Simulate PSE redirect delay
    setTimeout(() => {
        showSuccess();
    }, 2500);
};

const showSuccess = () => {
    // Clear cart
    localStorage.removeItem('mt_store_cart');
    
    const checkoutContainer = document.getElementById('checkout-container');
    const successScreen = document.getElementById('success-screen');
    
    // Generate real random order number in JS
    const orderNum = Math.floor(Math.random() * 90000) + 10000;

    gsap.to(checkoutContainer, { 
        opacity: 0, 
        y: -50, 
        duration: 0.5, 
        onComplete: () => {
            checkoutContainer.style.display = 'none';
            
            // Build success screen content dynamically so JS runs properly
            successScreen.innerHTML = `
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h1>¡Pago Exitoso!</h1>
                    <p>Gracias por tu compra en <strong>MT STORE</strong>. Hemos recibido tu pedido y estamos preparando tus tenis.</p>
                    <div class="order-id">Pedido #MT-${orderNum}</div>
                    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:2rem;">
                        <a href="/" class="auth-btn" style="display:inline-flex; align-items:center; gap:0.5rem;">
                            <i class="fa-solid fa-house"></i> VOLVER AL INICIO
                        </a>
                        <a href="/profile.html" class="auth-btn" style="display:inline-flex; align-items:center; gap:0.5rem; background:var(--accent-color); color:#1a1a1a;">
                            <i class="fa-solid fa-receipt"></i> VER MIS PEDIDOS
                        </a>
                    </div>
                </div>
            `;

            successScreen.style.display = 'flex';
            
            // Success animations
            gsap.from('.success-icon', { 
                scale: 0, 
                rotate: -180, 
                duration: 1, 
                ease: 'back.out(1.7)' 
            });
            gsap.from('.success-content h1, .success-content p, .order-id, .auth-btn', { 
                opacity: 0, 
                y: 20, 
                stagger: 0.15, 
                duration: 0.8, 
                delay: 0.4 
            });
        }
    });
};

const animateEntry = () => {
    gsap.from('.checkout-section', { 
        opacity: 0, 
        x: -50, 
        stagger: 0.2, 
        duration: 1, 
        ease: 'power3.out' 
    });
    gsap.from('.order-summary', { 
        opacity: 0, 
        x: 50, 
        duration: 1, 
        ease: 'power3.out' 
    });
};

initCheckout();
