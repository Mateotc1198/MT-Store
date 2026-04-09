**MT Store**

Este es mi proyecto de Ecommerse, la idea fue crear una tienda de calzado, usando Vite para el desarrollo y Firebase para la logica del backend.

**Lo que hace este proyecto**

**Compra**
- Catalogo: para filtrar los productos por marca y precio automaticamente.
- Pago: Simulacion de pago por PSE y que genera un recibo del pedido.

**Usuarios y perfil**
- Autenticacion con Firebase: Para el sistema de registro y login
- Historial de pedidos: Los usuarios pueden ver sus compras pasadas desde su perfil, esto gracias a los datos guardados en el Firestore.

**Panel de Administrador**
- Gestion: Puedo crear, editar o eliminar productos desde una interfaz privada.
- Imagenes: Las fotos se suben y se alojan en Firebase Storage.
- Control de pedidos: Panel para cambiar el estado de los envios(Pendiente y enviado)

**Tecnologias que use**
- Logica: JavaScript Vanilla 
- Estilos : CSS con variables, grid y flexbox, y una estetica Glassmorphism
- Animaciones: GSAP para las transiciones y movimientos
- Backend: Firebase para autenticar, firestore, storage.
- Herramientas: Vite para el despliegue rapido

**Estructura**
Para que se viera de una manera organizada organice el proyecto de la siguiente manera:
- src/config/: Conexion con Firebase.
- src/modules/: Logica para la autenticacion y el carrito
- src/ui/: El codigo JS que lo que hace es controlar todo lo que pasa en todas las vistas de HTML.

**Como Correrlo**
1. Clonar el repositorio: git clone https://github.com/tu-usuario/mt-store.git
2. Instalar todo: npm install.
3. Crear proyecto en Firebase y poner las credenciales en src/config/firebase-config.js.
4. Correr el proyecto: npm run dev.
