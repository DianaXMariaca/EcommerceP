# Sprint 1 — Git init, Catálogo y Autenticación

> Prompt de arranque para Claude Code en VS Code. Referencia de fondo: `REQUERIMIENTOS_TECNICOS_MVP.md` (Épica 1 y Épica 2, HU-01 a HU-03).

**Principio de construcción (vigente en todo el proyecto):** ante cualquier ambigüedad no cubierta aquí, elige siempre la opción más simple y efectiva. No agregues librerías ni patrones no solicitados. Documenta brevemente cualquier decisión no especificada.

---

## Paso 0 — Versionar el Sprint 0 (obligatorio, antes de tocar código nuevo)

Ejecuta, en orden, desde la raíz del proyecto:

```bash
git init
git add .
git commit -m "Sprint 0: monorepo base con health-check funcionando"
```

Antes del `commit`, confirma explícitamente que `git status` **no** lista `backend/.env` ni `frontend/.env` como archivos a comitear (deben quedar ignorados por el `.gitignore` ya existente). Si aparecen, detente y avísame — no continúes con el commit hasta resolverlo.

Al finalizar cada sprint siguiente, repite este patrón: commit al cierre con un mensaje que identifique el sprint.

---

## Paso 1 — Backend: Autenticación (HU-03)

Crear en `backend/src/`:

- **`middleware/auth.middleware.ts`**: middleware que valida el JWT del header `Authorization: Bearer <token>`, adjunta `req.user = { id, role }` si es válido, y responde `401` si falta o es inválido.
- **`middleware/requireRole.ts`**: middleware factory `requireRole(...roles)` que responde `403` si `req.user.role` no está en la lista permitida. Se usará en sprints futuros para proteger rutas de admin/soporte.
- **`controllers/auth.controller.ts`** con:
  - `register(req, res)`: valida email único, hashea password con `bcrypt` (10 rounds), crea `User` con `role: "customer"` por defecto, retorna JWT firmado (payload: `{ id, role }`, expiración 7 días).
  - `login(req, res)`: valida credenciales contra `passwordHash` con `bcrypt.compare`, retorna JWT igual que register. Responde `401` genérico ("credenciales inválidas") si el email no existe o el password no coincide — nunca reveles cuál de las dos falló.
- **`routes/auth.route.ts`**: monta `POST /api/auth/register` y `POST /api/auth/login`.

Validaciones mínimas (sin librería externa, validación manual simple):
- Email con formato válido y presente
- Password con mínimo 8 caracteres
- Responder `400` con mensaje claro si falla la validación

---

## Paso 2 — Backend: Catálogo (HU-01, HU-02)

Crear:
- **`controllers/product.controller.ts`** con:
  - `listProducts(req, res)`: soporta query params `category`, `brand`, `minPrice`, `maxPrice` (todos opcionales, combinables). Usa `where` dinámico de Prisma. Pagina con `take`/`skip` simples (default: primeros 20).
  - `getProductById(req, res)`: retorna un producto o `404`.
- **`routes/product.route.ts`**: monta `GET /api/products` y `GET /api/products/:id`. Ambas rutas son públicas (sin `auth.middleware`).
- **Seed de datos de prueba:** crear `backend/prisma/seed.ts` con al menos 20 productos tecnológicos variados (distintas categorías, marcas y rangos de precio, con `specs` como JSON simple, ej. `{ ram: "16GB", procesador: "i7" }`). Registrar el script en `backend/package.json`:
  ```json
  "prisma": { "seed": "ts-node prisma/seed.ts" }
  ```
  Ejecutar `npx prisma db seed` al finalizar.

---

## Paso 3 — Frontend: Páginas de autenticación

Crear en `frontend/src/`:
- **`lib/auth.ts`**: funciones `saveToken`, `getToken`, `clearToken` sobre `localStorage` (clave `auth_token`), y `getCurrentUserRole()` que decodifica el JWT (sin librería de verificación — solo lectura del payload, la verificación real la hace el backend).
- **`pages/Register.tsx`**: formulario email + password, llama `POST /api/auth/register` vía `apiFetch`, guarda el token si es exitoso, redirige al catálogo. Muestra error si falla.
- **`pages/Login.tsx`**: mismo patrón, contra `POST /api/auth/login`.
- Instalar `react-router-dom` y configurar rutas básicas en `App.tsx`: `/`, `/login`, `/register`, `/product/:id` (placeholder por ahora).

---

## Paso 4 — Frontend: Catálogo (HU-01, HU-02)

Crear:
- **`pages/Catalog.tsx`** (ruta `/`): 
  - Al montar, llama `GET /api/products` y renderiza una grilla de tarjetas (imagen, nombre, precio) usando los colores custom de Tailwind ya definidos (fondo `bg-neutral`, texto `text-primary`).
  - Barra de filtros simple (selects/inputs para categoría, marca, rango de precio) que reconstruye el query string y vuelve a pedir `/api/products` sin recargar la página.
  - Estado de carga (skeleton simple o texto "Cargando...") mientras llega la respuesta.
  - Responsiva: grilla de 1 columna en móvil, 3–4 en desktop (clases Tailwind `grid-cols-1 md:grid-cols-3 lg:grid-cols-4`).

---

## Definition of Done — Sprint 1

- [ ] Commit del Sprint 0 realizado, sin `.env` incluidos en git
- [ ] `POST /api/auth/register` crea usuario y retorna JWT válido; email duplicado responde `400`
- [ ] `POST /api/auth/login` retorna JWT con credenciales correctas; falla con `401` en credenciales incorrectas
- [ ] `GET /api/products` retorna los productos del seed y respeta combinaciones de filtros (`?category=laptops&minPrice=1000000`)
- [ ] Catálogo visible en `/` con al menos 20 productos, filtros funcionando sin recarga de página
- [ ] Registro y login funcionales desde el frontend, con token guardado en `localStorage`
- [ ] Todo corre con `npm run dev` desde la raíz, sin errores en consola

**No construyas en este sprint:** carrito, checkout, ni panel de administración. Eso es Sprint 2 en adelante, según `REQUERIMIENTOS_TECNICOS_MVP.md`.
