# Arquitectura Frontend - E-Commerce de Alquiler de Ropa (Armario UNSCH)

A continuación se detalla la arquitectura de la lógica de negocio para el frontend, basándose en la pila tecnológica elegida: **React + Tailwind CSS (Frontend) y Laravel (Backend)** comunicándose a través de **Inertia.js**, utilizando una arquitectura monolítica modular.

---

## 1. GESTIÓN DE ESTADO (STATE MANAGEMENT)

Al utilizar Inertia.js, el manejo del estado se simplifica enormemente, ya que el framework hace de puente entre el servidor y el cliente.

*   **Server-State (Estado del Servidor):**
    *   Se manejará de forma nativa a través de **Inertia Page Props**. Todo estado proveniente de la base de datos (usuario autenticado, catálogo de productos, mensajes de éxito/error flash) es inyectado desde Laravel.
*   **Client-State (Estado del Cliente):**
    *   **Zustand** es la herramienta elegida por ser moderna, limpia, y libre del boilerplate que requiere Redux.
*   **División de Estados Globales (Zustand):**
    *   `useCartStore`: Manejará el estado del carrito (ítems agregados, fechas de alquiler, cálculos de días y totales).
    *   `useUIStore`: Manejará estados visuales globales como la visibilidad del sidebar del carrito, modales de confirmación, menús móviles y notificaciones tipo toast.
*   **Estados Locales (React `useState` / `useReducer`):**
    *   Formularios, acordeones, y los filtros seleccionados temporalmente antes de aplicar la búsqueda definitiva.

---

## 2. FLUJO DE USUARIO (USER FLOW)

El flujo del usuario estudiante/docente será el siguiente:

1.  **Navegación del Catálogo:** El usuario ingresa a la vista principal y explora las categorías de ropa formal.
2.  **Selección de Producto:** Ingresa al detalle del traje o vestido para ver imágenes, descripción y reglas de alquiler.
3.  **Selección de Talla y Fechas:** A través de un `DateRangePicker`, elige la talla necesaria y el periodo de alquiler (Fecha Inicio - Fecha Fin).
4.  **Validación en Vivo:** Al seleccionar las fechas, se hace una consulta asíncrona rápida (vía Axios) para verificar que la prenda en esa talla (unidad de `inventario`) esté disponible.
5.  **Añadir al Carrito:** Si hay disponibilidad, se almacena en el `useCartStore`.
6.  **Proceso de Checkout:** El usuario revisa el carrito y procede. Si es invitado, es redirigido temporalmente al flujo de Login/Registro.
7.  **Confirmación:** Llena/confirma los datos de entrega (dirección en la UNSCH) y método de pago, generándose la `reserva` en el sistema.

---

## 3. LÓGICA DEL CARRITO (RENTAL CART)

El carrito en un sistema de alquiler es diferente al de una tienda normal; no se suman cantidades simples, sino que se bloquean unidades de inventario por rango de fechas.

*   **Tecnología:** Zustand con el middleware `persist` (localStorage) para que el estudiante no pierda sus selecciones si cierra la pestaña.
*   **Añadir Producto (`addToCart`):** Guarda el `producto_id`, `inventario_id` (la talla específica seleccionada), `fecha_inicio`, `fecha_fin`, `precio_alquiler` y `deposito_garantia`.
*   **Conflictos de Fechas:** Antes de añadir un nuevo ítem, el *Store* verifica que el usuario no esté intentando reservar el mismo `inventario_id` para fechas que se crucen con otro ítem ya existente en el propio carrito.
*   **Cálculo Dinámico:** Una función getter en Zustand calculará: 
    *   `Días = diffInDays(fecha_inicio, fecha_fin)` (Mínimo 1 día).
    *   `Subtotal = (precio_alquiler * Días)`.
    *   `Total a Pagar = Subtotal + deposito_garantia`.

---

## 4. LÓGICA DE DISPONIBILIDAD (CRÍTICO)

La disponibilidad es el corazón del sistema de alquiler para evitar choques (doble reserva).

*   **Validación Visual:** En el calendario del frontend de cada producto, las fechas que correspondan a registros en la tabla `disponibilidad` (para ese `inventario_id`) aparecerán deshabilitadas/bloqueadas.
*   **Validación Just-in-Time:** Antes del Checkout final, se dispara un request para revalidar que los ítems del carrito siguen libres.
*   **Feedback:** Si en ese intervalo alguien más reservó la prenda, se retira automáticamente del carrito mostrando un *Toast* de advertencia: *"Lo sentimos, el terno X ya fue reservado en esas fechas"*.

---

## 5. SISTEMA DE FILTROS Y BÚSQUEDA

Aprovechando el poder de Inertia, el filtrado actualizará la URL manteniendo el estado.

*   **Mecánica:** Al seleccionar una categoría (ej. "Ternos") o rango de precio, se ejecuta `router.get('/catalogo', { categoria: id }, { preserveState: true })`. Esto permite compartir el link de la búsqueda fácilmente.
*   **Búsqueda Textual y Debounce:** Para el input de buscar por nombre, se implementará un `useDebounce` (aprox. 300ms-500ms). Esto retrasa la petición al backend hasta que el usuario termina de tipear, reduciendo consultas innecesarias a la base de datos.
*   **Sincronización:** Los inputs del filtro siempre leerán su valor inicial desde los *Query Params* de la URL en caso de que se recargue la página.

---

## 6. AUTENTICACIÓN Y USUARIO

*   **Sesiones sin JWT:** Dado que es una arquitectura monolítica con Laravel e Inertia, se aprovechará la autenticación basada en **Cookies/Sesiones** provista por Laravel (Sanctum o Breeze). Es más segura contra ataques XSS.
*   **Protección de Rutas:** El middleware de Laravel protegerá endpoints como `/checkout` o `/mis-reservas`. Si el usuario no está autenticado, Laravel redirige a la vista de login, e Inertia maneja la transición suavemente.
*   **Roles y Permisos:** El usuario vendrá inyectado en `usePage().props.auth.user`. Con esto, crearemos un componente envoltorio `<HasRole role="ADMIN">...</HasRole>` que evaluará si `auth.user.rol_id` corresponde al administrador para mostrar menús ocultos de gestión.

---

## 7. CHECKOUT Y PAGOS

*   **Validación de Datos:** Uso del hook `useForm` de Inertia para manejar el envío, mostrando los mensajes de error automáticamente debajo de cada campo si el backend detecta fallos (ej. "Dirección obligatoria").
*   **Flujo de Pago:**
    1. Resumen de reserva.
    2. Integración con pasarela (puede usarse un SDK de frontend simulado o real como MercadoPago/Niubiz).
    3. Al confirmar el pago en la pasarela, se envía un `router.post` con el token de transacción y los datos del carrito hacia Laravel.
*   **Estados:** Se manejarán los estados `pending` (cargando el pago), `success` (redirige a la boleta) o `failed` (permite reintentar sin vaciar el carrito).

---

## 8. MANEJO DE ERRORES Y UX

*   **Errores API y Validación:** Los errores de formularios 422 son capturados por Inertia e inyectados en las *props*. Para peticiones asíncronas sueltas (Axios), se creará un Interceptor global que dispare notificaciones visuales (Toast) cuando ocurra un código 500, 401 o 403.
*   **Estados de Carga:** 
    *   Uso de `Skeleton Loaders` durante la hidratación de los componentes de listas de productos.
    *   Botones de Submit mostrarán spinners y aplicarán `disabled=true` automáticamente para prevenir múltiples envíos por doble click.
*   **Mensajes Claros:** Textos enfocados al usuario universitario ("Tu reserva ha sido confirmada y debes recoger el traje en Bienestar Universitario").

---

## 9. OPTIMIZACIÓN Y PERFORMANCE

*   **Lazy Loading / Code Splitting:** Inertia, configurado con Vite, divide automáticamente el bundle JavaScript por cada vista (`Page`). Modales pesados o SDKs de pago usarán `React.lazy()` para no penalizar el tiempo de carga (First Contentful Paint) inicial.
*   **Optimistic UI:** Al realizar acciones como marcar un producto favorito, la UI reaccionará instantáneamente antes de que el servidor responda, dando sensación de velocidad absoluta. Si el servidor falla, el estado se revierte (rollback visual).
*   **Prevención de Renderizados:** Se utilizará `React.memo` para tarjetas de catálogo y `useMemo` en el carrito para evitar recalcular operaciones matemáticas pesadas en cada render de la vista.
