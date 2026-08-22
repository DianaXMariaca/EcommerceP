# Sprint 3 — Checkout con pago simulado

> Prompt de arranque para Claude Code en VS Code. Referencia de fondo: `REQUERIMIENTOS_TECNICOS_MVP.md` (Épica 4, HU-05 y HU-06, ya actualizadas para pago simulado).

**Principio de construcción (vigente en todo el proyecto):** ante cualquier ambigüedad no cubierta aquí, elige siempre la opción más simple y efectiva. No agregues librerías ni patrones no solicitados. Documenta brevemente cualquier decisión no especificada.

**Sin prerrequisitos externos para este sprint.** No hay cuentas, credenciales ni gateways que configurar — todo se construye y prueba de punta a punta.

---

## Paso 0 — Verificación de working tree

Confirma con `git status` que no hay cambios pendientes del Sprint 2 sin commitear antes de empezar.

---

## Paso 1 — Backend: simulación de pago aislada

Crear **`backend/src/lib/payment.ts`**:
```ts
// Punto único de integración con una pasarela de pago real en el futuro.
// Por ahora, simula una aprobación automática.
export async function processPayment(amount: number): Promise<{ approved: boolean; reference: string }> {
  return {
    approved: true,
    reference: `MOCK-${crypto.randomUUID()}`,
  };
}
```
Esta función es el único lugar que se tocará cuando en el futuro se conecte un gateway real (Mercado Pago, Wompi, etc.) — el resto del checkout no debe depender de los detalles internos de esta función.

---

## Paso 2 — Backend: checkout (HU-05, HU-06)

Crear **`controllers/order.controller.ts`** con:

- **`checkout(req, res)`**: para el usuario autenticado (`req.user.id`):
  1. Lee todos sus `CartItem` (con producto incluido). Si el carrito está vacío, responde `400`.
  2. Valida que cada producto tenga `stock >= quantity` solicitada. Si alguno no alcanza, responde `400` con el detalle de qué producto no tiene stock suficiente — **no proceses el pago si algo falla aquí**.
  3. Calcula el `total` sumando `precio × cantidad` de todos los items.
  4. Llama `processPayment(total)`.
  5. Si `approved` es `true`, ejecuta lo siguiente **dentro de una única transacción Prisma (`prisma.$transaction`)** para que sea atómico:
     - Crea el `Order` con `status: "paid"` y un `trackingId` generado (ej. `TRK-` + 8 caracteres alfanuméricos aleatorios, en mayúsculas).
     - Crea un `OrderItem` por cada producto del carrito, guardando `unitPrice` al momento de la compra (no una referencia al precio actual del producto, que puede cambiar después).
     - Descuenta el `stock` de cada `Product` por la cantidad comprada.
     - Crea el `Payment` asociado con el `reference` que devolvió `processPayment`.
     - Elimina todos los `CartItem` del usuario (el carrito queda vacío tras pagar).
  6. Responde `201` con la orden completa (incluyendo `trackingId`, items y total).
- **`listOrders(req, res)`**: retorna las órdenes del usuario autenticado, más recientes primero, con sus items y productos incluidos.
- **`getOrderById(req, res)`**: retorna una orden específica, validando que pertenezca al usuario autenticado (`404` si no existe o no es suya).

Crear **`routes/order.route.ts`**, todas protegidas por `auth.middleware`:
```
POST   /api/orders/checkout
GET    /api/orders
GET    /api/orders/:id
```

---

## Paso 3 — Frontend: completar el carrito y agregar confirmación

En **`pages/Cart.tsx`**:
- Habilitar el botón "Ir a pagar" (ya no dice "Próximamente").
- Al hacer clic, llama `POST /api/orders/checkout`.
- Si responde error (ej. sin stock), muestra el mensaje devuelto por el backend sin recargar la página.
- Si responde éxito, dispara el evento `cart:updated` (para que el badge del carrito se actualice a 0) y navega a `/order/:id` usando el `id` de la orden recién creada.

Crear **`pages/OrderConfirmation.tsx`** (ruta `/order/:id`):
- Al montar, llama `GET /api/orders/:id`.
- Muestra: `trackingId` destacado, lista de productos comprados con cantidad y subtotal, total pagado, y un mensaje de confirmación ("¡Pedido confirmado! ✅"). Usa `cta-green` para el ícono/mensaje de éxito.
- Botón "Volver al catálogo" que lleva a `/`.

Crear **`pages/Orders.tsx`** (ruta `/orders`, enlazada desde `NavBar.tsx`):
- Lista las órdenes del usuario (`GET /api/orders`): fecha, trackingId, total, estado. Cada fila enlaza a `/order/:id`.
- Si no hay órdenes, mensaje simple con enlace al catálogo.

---

## Definition of Done — Sprint 3

- [ ] Un checkout con stock suficiente crea la orden, descuenta el stock correcto de cada producto, y vacía el carrito — verificable recargando Neon o el catálogo (el stock bajó)
- [ ] Un checkout con un producto sin stock suficiente responde `400`, no crea ninguna orden, no descuenta stock, y no vacía el carrito (probar que la operación es atómica: si un producto falla, ninguno se procesa)
- [ ] El `trackingId` generado es único y se muestra en la pantalla de confirmación
- [ ] `/orders` lista correctamente las órdenes del usuario logueado
- [ ] Otro usuario no puede ver `/order/:id` de una orden ajena (probar con dos usuarios distintos, debe responder `404`)
- [ ] Todo verificado en navegador real (no solo curl), incluyendo el flujo completo: catálogo → carrito → checkout → confirmación
- [ ] Commit de cierre: `git commit -m "Sprint 3: checkout con pago simulado y gestión de órdenes"`, confirmando que no se coló ningún `.env`

**No construyas en este sprint:** panel de administración ni roles de soporte/admin aplicados a las rutas (eso es Sprint 4, según `REQUERIMIENTOS_TECNICOS_MVP.md`).
