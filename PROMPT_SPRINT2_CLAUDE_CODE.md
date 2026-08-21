# Sprint 2 — Carrito de compras y fusión invitado→usuario

> Prompt de arranque para Claude Code en VS Code. Referencia de fondo: `REQUERIMIENTOS_TECNICOS_MVP.md` (Épica 3, HU-04, y la nota de diseño de la sección 5 sobre `CartItem`).

**Principio de construcción (vigente en todo el proyecto):** ante cualquier ambigüedad no cubierta aquí, elige siempre la opción más simple y efectiva. No agregues librerías ni patrones no solicitados. Documenta brevemente cualquier decisión no especificada.

---

## Paso 0 — Cierre de sprint anterior (patrón ya establecido)

Antes de escribir código nuevo, confirma que el working tree está limpio (`git status` sin cambios pendientes del Sprint 1). Si hay cambios sueltos sin commitear, avísame antes de continuar.

---

## Paso 1 — Backend: Endpoints de carrito (protegidos por auth)

Recordatorio de diseño (ya decidido, no lo cambies): `CartItem` en base de datos **solo existe para usuarios registrados** (`userId` obligatorio). El carrito de invitado vive 100% en `localStorage` del navegador — no hay tabla de sesión ni `session_id`.

Crear en `backend/src/`:

- **`controllers/cart.controller.ts`** con:
  - `getCart(req, res)`: retorna los `CartItem` del usuario autenticado (`req.user.id`), con el producto embebido (`include: { product: true }`) para que el frontend no tenga que pedir cada producto por separado.
  - `addItem(req, res)`: recibe `{ productId, quantity }`. Si ya existe un `CartItem` con ese `userId` + `productId`, **suma** la cantidad (no la reemplaza). Si no existe, lo crea. Usa el `@@unique([userId, productId])` ya definido en el schema con `upsert` de Prisma.
  - `removeItem(req, res)`: elimina un `CartItem` por su `id`, validando que pertenezca al `req.user.id` (nunca confíes en el `id` del body/params sin validar propiedad — otro usuario no debe poder borrar tu carrito).
  - `updateQuantity(req, res)`: actualiza la cantidad de un `CartItem` existente (validando propiedad igual que `removeItem`). Si la cantidad enviada es `0` o menor, elimínalo en vez de dejarlo en `0`.
  - `mergeCart(req, res)`: recibe un array `[{ productId, quantity }, ...]` (el carrito que venía en `localStorage`). Para cada item, hace el mismo `upsert` sumando cantidades que `addItem`. Retorna el carrito completo ya fusionado (mismo formato que `getCart`).
- **`routes/cart.route.ts`**: monta todas las rutas bajo `auth.middleware` (ninguna ruta de carrito es pública, porque solo existen carritos de usuarios logueados en el backend):
  ```
  GET    /api/cart
  POST   /api/cart/items          (addItem)
  PATCH  /api/cart/items/:id      (updateQuantity)
  DELETE /api/cart/items/:id      (removeItem)
  POST   /api/cart/merge
  ```

Validaciones mínimas: `productId` debe existir y tener `stock > 0` antes de permitir agregarlo (responder `400` con mensaje claro si no hay stock). No se descuenta stock todavía — eso ocurre en el checkout (Sprint 3).

---

## Paso 2 — Frontend: Carrito de invitado en localStorage

Crear:
- **`lib/guestCart.ts`**: funciones puras sobre una clave `guest_cart` en `localStorage` (array de `{ productId, quantity }`):
  - `getGuestCart()`, `addToGuestCart(productId, quantity)` (suma si ya existe), `removeFromGuestCart(productId)`, `updateGuestCartQuantity(productId, quantity)`, `clearGuestCart()`.
- **`lib/cart.ts`** (capa unificada que usan los componentes, para que no les importe si el usuario está logueado o no):
  - `isLoggedIn()` (reutiliza `getToken()` de `lib/auth.ts`)
  - `addToCart(productId, quantity)`: si está logueado, llama `POST /api/cart/items`; si no, usa `addToGuestCart`.
  - `getCartCount()`: retorna la suma de cantidades, desde el backend si está logueado o desde `localStorage` si no — usado para el badge del ícono de carrito.

## Paso 3 — Frontend: Fusión al iniciar sesión

En **`pages/Login.tsx`**, inmediatamente después de guardar el token exitosamente:
1. Leer `getGuestCart()`.
2. Si tiene items, llamar `POST /api/cart/merge` con ese array.
3. Llamar `clearGuestCart()`.
4. Recién entonces redirigir (así el usuario no ve un carrito vacío por un instante).

Aplica lo mismo en **`pages/Register.tsx`** — un usuario que se registra con productos ya en su carrito de invitado también debe fusionarlos.

---

## Paso 4 — Frontend: UI del carrito

Crear:
- **`pages/Cart.tsx`** (ruta `/cart`): lista los items (imagen, nombre, precio unitario, cantidad editable con `+`/`-`, subtotal por línea, botón eliminar), y un total general al final. Si el carrito está vacío, muestra un mensaje simple con enlace al catálogo. El botón "Ir a pagar" queda deshabilitado con texto "Próximamente" (el checkout real es Sprint 3).
- **Botón "Añadir al carrito"** en las tarjetas de `Catalog.tsx` y en `pages/Product.tsx` (completar la página de detalle de producto que quedó como placeholder en Sprint 1: imagen grande, specs, selector de cantidad, botón añadir).
- **Ícono de carrito con badge** en la barra de navegación (crear `components/NavBar.tsx` si no existe), mostrando `getCartCount()`, visible en todas las páginas.

Usa el color `cta-green` de Tailwind exclusivamente para el botón "Añadir al carrito" (según la identidad visual ya definida — es un CTA de compra).

---

## Definition of Done — Sprint 2

- [ ] Un usuario logueado puede agregar, cambiar cantidad y eliminar productos de su carrito, y esto persiste en Neon (verificable recargando la página)
- [ ] Un invitado (sin sesión) puede hacer lo mismo, persistiendo en `localStorage` (verificable recargando la página, sin perder el carrito)
- [ ] Al iniciar sesión (login o registro) con productos en el carrito de invitado, estos aparecen fusionados en el carrito del backend, y `localStorage` queda limpio después
- [ ] Intentar agregar un producto sin stock responde `400` y el frontend muestra el error
- [ ] El badge del ícono de carrito refleja la cantidad correcta en todo momento
- [ ] Commit de cierre: `git commit -m "Sprint 2: carrito con fusión invitado→usuario"`, confirmando de nuevo que no se coló ningún `.env`

**No construyas en este sprint:** checkout real, integración con Wompi, ni descuento de stock. Eso es Sprint 3, según `REQUERIMIENTOS_TECNICOS_MVP.md`.
