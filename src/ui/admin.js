import { auth, db, storage } from '../config/firebase-config';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    updateDoc,
    serverTimestamp,
    orderBy,
    query
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { formatCurrency } from '../modules/cart-manager';

const ADMIN_EMAIL = "admin@gmail.com";
let editingId = null; // Track which product is being edited

// Security Check — Show content ONLY when confirmed admin
auth.onAuthStateChanged(user => {
    const mainContent = document.getElementById('admin-main-content');
    const lockedScreen = document.getElementById('admin-locked');

    if (user && user.email === ADMIN_EMAIL) {
        // ✅ Admin confirmed — show panel
        if (mainContent) mainContent.style.display = 'block';
        if (lockedScreen) lockedScreen.style.display = 'none';
        
        initAdminTabs();
        loadInventory();
        loadOrders();
    } else if (user) {
// ... (rest of the file remains similar but I need to integrate the new functions)
        // Logged in but NOT admin
        if (lockedScreen) {
            lockedScreen.innerHTML = `
                <i class="fa-solid fa-ban" style="font-size: 4rem; color: #e55; margin-bottom: 1rem;"></i>
                <h3>Acceso Denegado</h3>
                <p>Tu cuenta no tiene permisos de administrador.</p>
                <a href="/" class="auth-btn" style="display:inline-block; margin-top: 1rem; text-decoration:none; padding: 0.8rem 2rem;">VOLVER A LA TIENDA</a>
            `;
        }
    }
    // If user is null, it's still checking — locked screen stays visible
});

// Add / Edit Product Logic
const productForm = document.getElementById('admin-product-form');
const formTitle = document.querySelector('.admin-form-container h2');
const submitBtn = document.getElementById('add-product-btn');
const adminMsg = document.getElementById('admin-msg');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const resetForm = () => {
    editingId = null;
    productForm.reset();
    if (formTitle) formTitle.innerText = 'Añadir Nuevo Tenis';
    if (submitBtn) submitBtn.innerText = 'PUBLICAR EN LA TIENDA';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    if (adminMsg) adminMsg.innerText = '';
};

// Timeout wrapper for Storage uploads
const uploadWithTimeout = (storageRef, file, timeoutMs = 15000) => {
    return Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(
                'La subida de imagen tardó demasiado. Puede que las reglas de Firebase Storage no permitan escritura. Usa una URL de imagen en su lugar.'
            )), timeoutMs)
        )
    ]);
};

if (productForm) {
    productForm.onsubmit = async (e) => {
        e.preventDefault();
        const wasEditing = !!editingId;
        submitBtn.disabled = true;
        submitBtn.innerText = wasEditing ? 'Guardando cambios...' : 'Subiendo imagen...';
        adminMsg.innerText = '';

        try {
            const file = e.target['p-image'].files[0];
            const imageUrlInput = document.getElementById('p-image-url');
            let imageUrl = editingId ? document.getElementById('p-current-image').value : '';

            // Priority: file upload > URL input > existing URL
            if (file) {
                try {
                    const storageRef = ref(storage, `productos/${Date.now()}_${file.name}`);
                    const snapshot = await uploadWithTimeout(storageRef, file);
                    imageUrl = await getDownloadURL(snapshot.ref);
                } catch (uploadErr) {
                    console.error('Upload failed:', uploadErr);
                    // Check if there's a URL fallback
                    if (imageUrlInput && imageUrlInput.value.trim()) {
                        imageUrl = imageUrlInput.value.trim();
                    } else if (!imageUrl) {
                        throw new Error('Error al subir imagen. Pega una URL de imagen en el campo alternativo.');
                    }
                    adminMsg.style.color = 'orange';
                    adminMsg.innerText = '⚠️ Imagen no subida, usando URL alternativa.';
                }
            } else if (imageUrlInput && imageUrlInput.value.trim()) {
                imageUrl = imageUrlInput.value.trim();
            }

            if (!imageUrl) {
                throw new Error('Debes proporcionar una imagen (archivo o URL).');
            }

            const productData = {
                name: e.target['p-name'].value,
                marca: e.target['p-marca'].value,
                price: Number(e.target['p-price'].value),
                imageUrl: imageUrl,
                description: e.target['p-desc'].value,
            };

            if (editingId) {
                await updateDoc(doc(db, 'productos', editingId), productData);
                adminMsg.style.color = 'green';
                adminMsg.innerText = '✅ ¡Producto actualizado correctamente!';
            } else {
                productData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'productos'), productData);
                adminMsg.style.color = 'green';
                adminMsg.innerText = '✅ ¡Producto publicado exitosamente!';
            }

            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            adminMsg.style.color = 'red';
            adminMsg.innerText = `❌ ${error.message || 'Error al guardar el producto.'}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR EN LA TIENDA';
        }
    };
}

if (cancelEditBtn) cancelEditBtn.onclick = resetForm;

// --- Inventory Logic ---
const loadInventory = () => {
    const inventoryList = document.getElementById('admin-products-list');
    if (!inventoryList) return;

    const q = query(collection(db, "productos"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        inventoryList.innerHTML = '';
        if (snapshot.empty) {
            inventoryList.innerHTML = '<p>No hay productos en el inventario.</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const id = docSnap.id;
            const item = document.createElement('div');
            item.className = 'inventory-item';
            item.innerHTML = `
                <img src="${product.imageUrl || '/assets/hero_sneaker.png'}" width="60" style="border-radius:8px; object-fit:contain; background:#fafafa;">
                <div class="info" style="flex:1;">
                    <strong>${product.name}</strong>
                    <span style="color:#888; font-size:0.85rem;">${product.marca || ''} &bull; ${formatCurrency(product.price)}</span>
                </div>
                <button class="edit-btn" data-id="${id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" data-id="${id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            `;
            
            // EDIT
            item.querySelector('.edit-btn').onclick = () => {
                editingId = id;
                document.getElementById('p-name').value = product.name;
                document.getElementById('p-marca').value = product.marca || '';
                document.getElementById('p-price').value = product.price;
                document.getElementById('p-desc').value = product.description || '';
                document.getElementById('p-current-image').value = product.imageUrl || '';
                if (formTitle) formTitle.innerText = `Editando: ${product.name}`;
                if (submitBtn) submitBtn.innerText = 'GUARDAR CAMBIOS';
                if (cancelEditBtn) cancelEditBtn.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            // DELETE
            item.querySelector('.delete-btn').onclick = async () => {
                if (confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
                    await deleteDoc(doc(db, "productos", id));
                    if (editingId === id) resetForm();
                }
            };
            
            inventoryList.appendChild(item);
        });
    });
};

// --- Tab Navigation ---
const initAdminTabs = () => {
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`section-${target}`).classList.add('active');
        };
    });
};

// --- Orders Logic ---
const loadOrders = () => {
    const ordersList = document.getElementById('admin-orders-list');
    if (!ordersList) return;

    const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            ordersList.innerHTML = '<p style="text-align:center; color:#888;">No hay pedidos registrados.</p>';
            return;
        }

        ordersList.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const order = docSnap.data();
            const id = docSnap.id;
            const card = document.createElement('div');
            card.className = 'admin-order-card';

            const date = order.createdAt ? order.createdAt.toDate().toLocaleString() : 'Recién creado';

            card.innerHTML = `
                <div class="admin-order-header">
                    <div>
                        <h3>Pedido #${id.slice(-6).toUpperCase()}</h3>
                        <div class="admin-order-user">
                            <i class="fa-solid fa-user"></i> ${order.userEmail} | 
                            <i class="fa-solid fa-calendar"></i> ${date}
                        </div>
                    </div>
                    <div class="admin-order-controls">
                        <select class="admin-status-select" data-id="${id}">
                            <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="completado" ${order.status === 'completado' ? 'selected' : ''}>Completado</option>
                            <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                        <button class="delete-btn order-delete-btn" data-id="${id}" title="Eliminar Pedido">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="admin-order-items">
                    ${order.items.map(item => `
                        <div class="admin-order-item">
                            <span>${item.name} (x${item.quantity})</span>
                            <span>${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="admin-order-footer">
                    <div>
                        <span class="status-badge status-${order.status || 'pendiente'}">${order.status || 'pendiente'}</span>
                        <small style="margin-left:1rem; color:#888;">Método: ${order.paymentMethod || 'PSE'} (${order.bank || 'Banco'})</small>
                    </div>
                    <div class="admin-order-total">Total: ${formatCurrency(order.total)}</div>
                </div>
            `;

            // Status Update
            card.querySelector('.admin-status-select').onchange = (e) => {
                updateOrderStatus(id, e.target.value);
            };

            // Delete Order
            card.querySelector('.order-delete-btn').onclick = () => {
                if (confirm('¿Seguro que quieres eliminar este pedido del historial?')) {
                    deleteDoc(doc(db, 'pedidos', id));
                }
            };

            ordersList.appendChild(card);
        });
    });
};

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        await updateDoc(doc(db, "pedidos", orderId), {
            status: newStatus
        });
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Error al actualizar el estado del pedido.");
    }
};

// Initial calls are handled within auth.onAuthStateChanged for security
