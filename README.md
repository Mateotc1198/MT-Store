# MT STORE — Premium Sneakers Boutique 👟✨

**MT STORE** es una plataforma de comercio electrónico de alta gama diseñada para ofrecer una experiencia de compra exclusiva, minimalista y de alto rendimiento. Inspirada en estéticas contemporáneas como las de Nike y boutique shops, este proyecto combina funcionalidades robustas con un diseño visualmente impactante.

## 🚀 Características Principales

### 💎 Experiencia de Usuario (UX)
- **Diseño Premium Light/Dark**: Estética equilibrada con una paleta de colores HSL refinada, tipografía Oswald para títulos impactantes e Inter para lectura fluida.
- **Animaciones GSAP**: Micro-interacciones suaves, efectos de hover premium y transiciones de entrada fluidas.
- **Skeleton Screens**: Carga elegante de productos mediante shimmer beige para evitar saltos de contenido.
- **Feedback Visual**: Sistema de notificaciones (Toasts) para confirmación de acciones en tiempo real.

### 🛒 Core E-commerce
- **Catálogo Dinámico**: Filtrado inteligente por marca y ordenamiento por precio en tiempo real.
- **Carrito de Compras Persistente**: Gestión local del carrito que permite añadir productos incluso sin haber iniciado sesión.
- **Detalle de Producto Pro**: Selección de tallas, control de cantidades y carrusel de productos recomendados.
- **Checkout Seguro**: Simulación de pasarela de pago (PSE) con validaciones y generación de número de pedido.

### 🔐 Autenticación y Perfil
- **Firebase Auth**: Registro e inicio de sesión seguro.
- **Perfil de Usuario**: Historial detallado de pedidos anteriores extraídos directamente de Firestore.
- **Gestión de Sesión**: Menú desplegable dinámico que sincroniza el estado del usuario en todas las páginas.

### 🛡️ Panel de Administración (Admin Dashboard)
- **Gestión de Inventario**: CRUD completo de productos (Crear, Editar, Eliminar) con previsualización de imágenes.
- **Subida de Archivos**: Integración con Firebase Storage para imágenes de productos (con fallback a URLs externas).
- **Gestión de Pedidos**: Panel administrativo para monitorear ventas, actualizar estados de envío (Pendiente, Enviado, Completado) y gestionar el historial de pedidos.

---

## 🛠️ Stack Tecnológico

- **Core**: HTML5 Semántico, JavaScript (ES6+ Modules).
- **Estilos**: Vanilla CSS (CSS Variables, Glassmorphism, Flexbox, CSS Grid).
- **Animaciones**: [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/).
- **Backend as a Service**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage).
- **Tooling**: [Vite](https://vitejs.dev/) para desarrollo y build ultra-rápido.

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular y organizada para máxima mantenibilidad:

```
Ecommerse2/
├── 📁 assets/                    # Imágenes, logos y recursos gráficos
├── 📁 css/                       # Hoja de estilos global (Diseño Premium)
├── 📁 src/
│   ├── 📁 config/                # Configuración de Firebase
│   ├── 📁 modules/               # Lógica compartida (Auth, Cart Manager)
│   └── 📁 ui/                    # Lógica específica por vista (Admin, Detail, Checkout, etc.)
├── index.html                    # Página principal (Landing & Catálogo)
├── admin.html                    # Panel de administración
├── checkout.html                 # Pasarela de pago
├── login.html / register.html    # Vistas de autenticación
├── product.html                  # Detalle de producto dinámico
├── profile.html                  # Perfil y pedidos del usuario
└── main.js                       # Punto de entrada y lógica global
```

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/mt-store.git
   cd mt-store
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Firebase**:
   Crea un proyecto en [Firebase Console](https://console.firebase.google.com/), activa Auth, Firestore y Storage, y actualiza las credenciales en `src/config/firebase-config.js`.

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

5. **Build para producción**:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Este proyecto fue desarrollado como una demostración técnica de habilidades en desarrollo Frontend y manejo de Firebase. Puedes usarlo como base para tus propios proyectos.

---
**Desarrollado con ❤️ para los amantes de los sneakers.**
