# Sprint 4 — Roles aplicados y panel de administración

> Prompt de arranque para Claude Code en VS Code. Referencia de fondo: `REQUERIMIENTOS_TECNICOS_MVP.md` (Épica 5, HU-07 a HU-09, y la matriz de roles de la sección 8).

**Principio de construcción (vigente en todo el proyecto):** ante cualquier ambigüedad no cubierta aquí, elige siempre la opción más simple y efectiva. No agregues librerías ni patrones no solicitados. Documenta brevemente cualquier decisión no especificada.

**Sin prerrequisitos externos para este sprint.**

---

## Paso 0 — Verificación de working tree

Confirma con `git status` que no hay cambios pendientes del Sprint 3 sin commitear antes de empezar.

---

## Paso 1 — Backend: promover usuarios a soporte/admin (solo para pruebas)

No hay pantalla de "gestión de roles" en el alcance del MVP — los roles se asignan manualmente en la base de datos para efectos de prueba. Crear un script simple **`backend/prisma/promote.ts`** que reciba un email por línea de comandos y actualice el `role` de ese usuario a `admin` o `support`:
```bash
npx ts-node prisma/promote.ts usuario@ejemplo.com admin
```
Esto es solo una herramienta de desarrollo, no una funcionalidad del producto — no construyas UI para esto.

---

## Paso 2 — Backend: proteger rutas existentes con roles (matriz de la sección 8)

Usando el `requireRole` ya creado en el Sprint 1, aplica los siguientes cambios a rutas **ya existentes** (no dupliques rutas, agrega el middleware donde corresponda):

- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` → agregar `requireRole("admin")`
- `PATCH /api/orders/:id/status` → **crear esta ruta nueva** (no existía) en `order.route.ts`, protegida con `requireRole("support", "admin")`. El controller `updateOrderStatus(req, res)` cambia el `status` de una orden a cualquiera de `pending/paid/shipped/delivered`, sin restricción de que sea la orden de ese usuario (soporte/admin puede modificar cualquier orden).
- `GET /api/orders` → modificar el controller existente: si `req.user.role` es `support` o `admin`, retorna **todas** las órdenes (con datos básicos del cliente: email); si es `customer`, se comporta igual que antes (solo las propias).
- Crear `GET /api/users/:id` (protegida con `requireRole("support", "admin")`) que retorna el perfil de un usuario (email, role, fecha de registro) y sus órdenes — **nunca** el `passwordHash`, ni siquiera a un admin.
- Crear `GET /api/admin/summary` (protegida con `requireRole("admin")`) que retorna: total de ventas (suma de `total` de órdenes con `status != "pending"`), número de órdenes, número de usuarios registrados.

---

## Paso 3 — Frontend: rutas protegidas por rol

- En `lib/auth.ts`, ya existe `getCurrentUserRole()` del Sprint 1 — úsala para condicionar la navegación.
- Crear un componente **`components/ProtectedRoute.tsx`** que reciba `allowedRoles` como prop y redirija a `/` si el rol del usuario actual no está en la lista (para las rutas de soporte/admin de abajo).
- En `NavBar.tsx`: mostrar un enlace "Panel" solo si el rol es `support` o `admin`, apuntando a `/panel`.

Crear las páginas (todas envueltas en `ProtectedRoute`):
- **`pages/admin/Panel.tsx`** (ruta `/panel`, roles `support`+`admin`): tabla de todas las órdenes (`GET /api/orders` con rol elevado) con email del cliente, trackingId, total, estado, y un selector para cambiar el estado (`PATCH /api/orders/:id/status`) directamente desde la fila.
- **`pages/admin/ProductManager.tsx`** (ruta `/panel/products`, solo `admin`): tabla de productos con botones editar/eliminar, y un formulario simple para crear uno nuevo. Usa los endpoints ya protegidos del Paso 2.
- **`pages/admin/Dashboard.tsx`** (ruta `/panel/dashboard`, solo `admin`): muestra las 3 métricas de `GET /api/admin/summary` como tarjetas simples (sin gráficos — texto grande y claro basta para el MVP).

Navegación simple entre estas tres vistas con un menú lateral o pestañas dentro de `/panel` — no uses una librería de UI adicional, con Tailwind básico alcanza.

---

## Definition of Done — Sprint 4

- [ ] Un usuario `customer` que intenta acceder a `POST /api/products` o `PATCH /api/orders/:id/status` recibe `403`
- [ ] Un usuario `customer` que navega a `/panel` en el frontend es redirigido a `/`
- [ ] Un usuario `support` puede ver todas las órdenes y cambiar su estado, pero un intento de `DELETE /api/products/:id` con su token responde `403`
- [ ] Un usuario `admin` puede crear, editar y eliminar productos desde `/panel/products`, y ve las métricas correctas en `/panel/dashboard`
- [ ] `GET /api/users/:id` nunca incluye `passwordHash` en la respuesta (verificarlo explícitamente, no solo que la pantalla no lo muestre)
- [ ] Todo verificado en navegador real con al menos dos usuarios de prueba (uno `customer`, uno `admin` o `support` promovido con el script)
- [ ] Commit de cierre: `git commit -m "Sprint 4: roles aplicados y panel de administración"`, confirmando que no se coló ningún `.env`

**Con este sprint se completa el Definition of Done del MVP completo** (sección 11 de `REQUERIMIENTOS_TECNICOS_MVP.md`), salvo el despliegue a producción simulada, que es el Sprint 5.
