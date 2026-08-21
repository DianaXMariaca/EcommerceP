# Requerimientos Técnicos y Arquitectura — MVP E-commerce de Productos Tecnológicos

**Versión:** 1.0 (reemplaza el documento conceptual inicial)
**Tipo de proyecto:** MVP interno para validación con usuarios reales
**Principio rector:** simplicidad sobre completitud. Cada decisión de esta sección elimina opciones del documento original a propósito, para que la construcción no se paralice evaluando alternativas.

---

## 1. Resumen ejecutivo

El documento original listaba tecnologías posibles (React/Next/Vue, Node/Python/Java, SQL/NoSQL, ElasticSearch/Algolia, etc.) sin decidir entre ellas. Para un MVP construido por una sola persona con ayuda de Claude Code, eso es una fuente de fricción, no de flexibilidad. Este documento **decide** el stack, **define** el alcance real del MVP, y **traduce** las funcionalidades en historias de usuario con criterios de aceptación, listas para implementarse en sprints cortos.

Objetivo del MVP: validar con usuarios reales el flujo completo *ver catálogo → agregar al carrito → pagar → recibir confirmación*, con separación real de frontend y backend.

---

## 2. Alcance del MVP (dentro / fuera)

**Dentro de alcance (v1):**
- Catálogo de productos con filtros básicos (categoría, precio, marca)
- Registro/login con email y contraseña (JWT)
- Carrito persistente (invitado en el navegador → se fusiona con el carrito del usuario al iniciar sesión)
- Checkout con una sola pasarela de pago (sandbox)
- Gestión de pedidos e inventario básico (descuento de stock al pagar)
- 3 roles: Cliente, Soporte, Administrador
- Panel de administración simple (CRUD de productos, ver pedidos)

**Fuera de alcance (v1) — explícitamente pospuesto:**
- Login social (Google/Apple)
- Buscador tipo Algolia/ElasticSearch (se usa búsqueda simple con Postgres)
- Múltiples pasarelas de pago simultáneas
- Notificaciones push / SMS (Twilio, FCM)
- Auto-scaling, CDN, multi-cloud
- App móvil nativa (React Native/Flutter)
- Cumplimiento formal PCI-DSS/GDPR (se aplican buenas prácticas, pero no certificación — no aplica a un MVP interno sin procesar tarjetas directamente)

Esta lista "fuera de alcance" no es un descarte: es el backlog de la v2, y debe quedar así de explícito para que Claude Code no la construya por iniciativa propia.

---

## 3. Stack tecnológico recomendado (decidido, no opcional)

Criterio: **un solo lenguaje, una sola base de datos, cero infraestructura extra hasta que se necesite.**

| Capa | Elección | Por qué (no la alternativa) |
|---|---|---|
| Frontend | **React + Vite + TailwindCSS** | Next.js añade SSR/routing de servidor que este MVP no necesita (no hay requisito SEO crítico); Vite es más simple y rápido para desarrollo local |
| Backend | **Node.js + Express + TypeScript** | Mismo lenguaje que el frontend (JS/TS) reduce la carga cognitiva; Express es el framework con más ejemplos y menor curva que NestJS |
| Base de datos | **PostgreSQL único** (con Prisma como ORM) | Reemplaza el esquema dual SQL+NoSQL del documento original. Postgres maneja catálogo, carritos y caché de sesión sin necesitar Mongo/Redis en el MVP |
| Autenticación | **JWT propio** (sin OAuth social) | Login social se pospone a v2; JWT simple cubre el caso de uso actual |
| Pasarela de pago | **Wompi (sandbox)** | Gateway colombiano, documentación simple, sandbox gratuito. Alternativa de respaldo: Mercado Pago si Wompi no cubre el caso de uso |
| Búsqueda/filtros | **Consultas SQL con índices en Postgres** | ElasticSearch/Algolia son infraestructura adicional injustificada para un catálogo de MVP |
| Repositorio | **Monorepo** con `/frontend` y `/backend` | Un solo repo es más simple de gestionar para Claude Code y para ti en VS Code |

### Infraestructura y despliegue
- **Ahora:** backend y frontend corren local (`localhost:4000` y `localhost:5173`), pero la base de datos usa **Neon.tech (free tier) desde el Sprint 0** — evita instalar y administrar Postgres localmente, y elimina el paso de migración de datos más adelante, porque ya es la misma base que se usará en el paso a producción simulada.
- **Paso a "producción simulada" (free tier):**
  - Frontend → **Vercel** (deploy gratuito de sitios estáticos/Vite)
  - Backend → **Render.com** (free web service)
  - Base de datos → la misma instancia de **Neon.tech** ya en uso desde el desarrollo
- Sin CDN propio, sin auto-scaling, sin multi-región — se añaden solo si el MVP valida tracción real.

---

## 4. Arquitectura del sistema

```
┌─────────────────┐        HTTPS/JSON         ┌──────────────────┐
│   Frontend       │ ────────────────────────► │   Backend API     │
│   React + Vite    │ ◄──────────────────────── │   Express + TS    │
│   (Vercel)         │        REST API           │   (Render)         │
└─────────────────┘                            └────────┬─────────┘
                                                             │
                                                    Prisma ORM
                                                             │
                                                   ┌─────────▼─────────┐
                                                   │   PostgreSQL       │
                                                   │   (Neon/Supabase)  │
                                                   └─────────────────┘
```

- Frontend y backend son **proyectos independientes** que se comunican solo por API REST — sin acoplamiento de código.
- El backend es la única capa con acceso a la base de datos (el frontend nunca habla directo con Postgres).
- Autenticación vía JWT en headers (`Authorization: Bearer <token>`).

---

## 5. Modelo de datos (entidades principales)

| Entidad | Campos clave |
|---|---|
| `User` | id, email, password_hash, role (`customer`/`support`/`admin`), created_at |
| `Product` | id, name, description, price, brand, category, specs (JSON), stock, image_url |
| `CartItem` | id, user_id, product_id, quantity |
| `Order` | id, user_id, status (`pending`/`paid`/`shipped`/`delivered`), total, tracking_id, created_at |
| `OrderItem` | id, order_id, product_id, quantity, unit_price |
| `Payment` | id, order_id, gateway_reference, status, amount |

Nota de diseño (versión más simple): `CartItem` solo existe en base de datos para usuarios **registrados** (`user_id` obligatorio, sin nullable). El carrito de un invitado vive **exclusivamente** en `localStorage` del navegador — no hay tabla intermedia ni `session_id` en el backend. Al iniciar sesión, el frontend envía el contenido de `localStorage` a `POST /api/cart/merge`, que lo inserta como `CartItem` del usuario. Esto simplifica el backend (una tabla menos que sincronizar) a cambio de que el carrito de invitado no sobreviva un cambio de dispositivo antes del login — trade-off aceptable para un MVP.

---

## 6. Requerimientos funcionales — Historias de usuario (formato ágil)

### Épica 1: Catálogo
- **HU-01:** Como cliente, quiero ver una lista de productos con imagen, nombre y precio, para explorar el catálogo.
  *Criterio de aceptación:* la lista carga en menos de 2s con datos de prueba (≥20 productos) y es responsiva en móvil.
- **HU-02:** Como cliente, quiero filtrar productos por categoría, marca y rango de precio, para encontrar lo que busco.
  *Criterio de aceptación:* los filtros se pueden combinar y actualizan la lista sin recargar la página.

### Épica 2: Cuenta de usuario
- **HU-03:** Como usuario, quiero registrarme e iniciar sesión con email y contraseña, para tener una cuenta.
  *Criterio de aceptación:* contraseñas hasheadas (bcrypt), sesión persistida vía JWT, validación de email único.

### Épica 3: Carrito
- **HU-04:** Como cliente (invitado o registrado), quiero agregar/quitar productos de mi carrito, para prepararme a comprar.
  *Criterio de aceptación:* el carrito persiste al recargar la página; al iniciar sesión, el carrito de invitado se fusiona con el del usuario.

### Épica 4: Checkout y pagos
- **HU-05:** Como cliente, quiero pagar mi pedido con tarjeta en sandbox, para completar la compra.
  *Criterio de aceptación:* integración con Wompi sandbox; al aprobarse el pago, se crea la orden y se descuenta el stock.
- **HU-06:** Como cliente, quiero recibir un número de seguimiento (Tracking ID) al pagar, para rastrear mi pedido.
  *Criterio de aceptación:* el Tracking ID se genera automáticamente y se muestra en la confirmación.

### Épica 5: Roles y administración
- **HU-07:** Como administrador, quiero crear, editar y eliminar productos, para mantener el catálogo actualizado.
- **HU-08:** Como agente de soporte, quiero ver el perfil y pedidos de un cliente (sin ver su contraseña) y actualizar el estado de un envío, para resolver incidencias.
  *Criterio de aceptación:* el rol `support` no tiene acceso a endpoints de eliminación de productos ni cambio de precios (control a nivel de middleware de autorización).
- **HU-09:** Como administrador, quiero ver un resumen de ventas totales, para monitorear el negocio.

---

## 7. Requerimientos no funcionales (ajustados a MVP)

- **Seguridad:** HTTPS obligatorio en producción (gratis vía Vercel/Render), contraseñas con bcrypt, JWT con expiración, validación de inputs en backend (evitar inyección SQL vía Prisma parametrizado).
- **Rendimiento:** sin requisito de picos de tráfico masivo; suficiente con la capa gratuita de Render/Neon.
- **Mantenibilidad:** código en TypeScript en ambas capas, estructura de carpetas clara, variables de entorno para credenciales (nunca hardcodeadas).
- **Escalabilidad futura (documentada, no implementada):** si el MVP valida tracción, migrar Render → un VPS o contenedor con auto-scaling, y evaluar caché con Redis solo si el catálogo crece significativamente.

---

## 8. Roles y permisos (matriz)

| Acción | Cliente | Soporte | Admin |
|---|:---:|:---:|:---:|
| Ver catálogo y filtrar | ✅ | ✅ | ✅ |
| Gestionar su propio carrito | ✅ | — | — |
| Pagar / crear pedido | ✅ | — | — |
| Ver historial propio | ✅ | — | — |
| Ver perfil/pedidos de otros clientes | ❌ | ✅ | ✅ |
| Ver contraseñas de clientes | ❌ | ❌ | ❌ (nunca, ni admin — se almacenan hasheadas) |
| Actualizar estado de envío | ❌ | ✅ | ✅ |
| Crear/editar/eliminar productos | ❌ | ❌ | ✅ |
| Cambiar precios | ❌ | ❌ | ✅ |
| Ver métricas de ventas | ❌ | ❌ | ✅ |

---

## 9. Diseño de API (endpoints REST — resumen)

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login

Productos
  GET    /api/products            (filtros por query params)
  GET    /api/products/:id
  POST   /api/products            [admin]
  PUT    /api/products/:id        [admin]
  DELETE /api/products/:id        [admin]

Carrito
  GET    /api/cart
  POST   /api/cart/items
  DELETE /api/cart/items/:id
  POST   /api/cart/merge          (al iniciar sesión)

Pedidos
  POST   /api/orders/checkout     (crea orden + inicia pago)
  GET    /api/orders              (propios; todos si admin/support)
  PATCH  /api/orders/:id/status   [support/admin]

Pagos
  POST   /api/payments/webhook    (confirmación desde Wompi)
```

---

## 10. Identidad visual (heredada del documento original)

Se conserva la paleta definida, aplicada con Tailwind:

| Uso | Color |
|---|---|
| Fondo general (90% pantalla) | Gris neutro claro |
| Títulos y texto principal | Azul pizarra oscuro |
| Botones secundarios / enlaces | Azul eléctrico |
| CTA de compra ("Añadir al carrito", "Pagar") — uso exclusivo | Verde esmeralda |

---

## 11. Plan de sprints sugerido (2 semanas c/u)

| Sprint | Objetivo | Entregable |
|---|---|---|
| **Sprint 0** | Setup del monorepo, Postgres + Prisma, esqueleto Express, esqueleto React+Vite | Ambos proyectos corren en local, health-check `GET /api/health` |
| **Sprint 1** | HU-01, HU-02, HU-03 | Catálogo navegable + registro/login funcional |
| **Sprint 2** | HU-04 | Carrito con persistencia y fusión invitado→usuario |
| **Sprint 3** | HU-05, HU-06 | Checkout con Wompi sandbox funcionando end-to-end |
| **Sprint 4** | HU-07, HU-08, HU-09 | Panel admin/soporte con roles aplicados |
| **Sprint 5** | Deploy a Vercel + Render + Neon | MVP accesible por URL pública para pruebas con usuarios reales |

**Definition of Done del MVP:** un usuario puede registrarse, navegar el catálogo, agregar productos al carrito, pagar en sandbox, y ver su pedido con Tracking ID — todo accesible desde una URL pública gratuita, sin intervención manual en base de datos.

---

## 12. Siguiente paso

Este documento es la base que se entregará a **Claude Code** en VS Code para la construcción. El siguiente paso aquí, contigo, es definir el **prompt de arranque para el Sprint 0** (estructura de carpetas, dependencias exactas, scripts de arranque) antes de pasarlo a ejecución.
