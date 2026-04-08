import { auth, db } from '../config/firebase-config';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot 
} from "firebase/firestore";
import { formatCurrency } from '../modules/cart-manager';
import gsap from 'gsap';

const initProfile = () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        document.getElementById('user-welcome').innerText = `¡Hola, ${user.displayName || user.email.split('@')[0]}!`;
        document.getElementById('user-email').innerText = user.email;

        loadOrders(user.uid);
    });
};

const loadOrders = (userId) => {
    const ordersList = document.getElementById('orders-list');
    const q = query(
        collection(db, "pedidos"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
        ordersList.innerHTML = '';

        if (snapshot.empty) {
            ordersList.innerHTML = '<p class="empty-msg">Aún no has realizado ningún pedido.</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const order = doc.data();
            const date = order.createdAt?.toDate().toLocaleDateString('es-CO', {
                year: 'numeric', month: 'long', day: 'numeric'
            }) || 'Reciente';

            // Build items HTML
            const itemsHTML = (order.items || []).map(item => `
                <div class="order-item-row">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-qty">x${item.quantity}</span>
                    <span class="order-item-price">${formatCurrency(item.price * item.quantity)}</span>
                </div>
            `).join('');

            const card = document.createElement('div');
            card.className = 'order-card';
            card.innerHTML = `
                <div class="order-card-header">
                    <div>
                        <div class="order-id">PEDIDO #${doc.id.slice(0, 8).toUpperCase()}</div>
                        <div class="order-meta">${date} &bull; ${order.paymentMethod || 'PSE'} &bull; ${order.bank || ''}</div>
                    </div>
                    <div class="order-status">✅ Completado</div>
                </div>
                <div class="order-items-list">
                    ${itemsHTML}
                </div>
                <div class="order-card-footer">
                    <span>TOTAL</span>
                    <span class="order-total">${formatCurrency(order.total)}</span>
                </div>
            `;
            ordersList.appendChild(card);
        });

        gsap.from('.order-card', { 
            opacity: 0, 
            x: -20, 
            stagger: 0.1, 
            duration: 0.5 
        });
    }, (error) => {
        console.error("Error loading orders:", error);
        if (error.code === 'failed-precondition') {
            ordersList.innerHTML = '<div class="no-products">Configurando historial... (Habilita el índice en la consola de Firebase).</div>';
        }
    });
};

initProfile();
