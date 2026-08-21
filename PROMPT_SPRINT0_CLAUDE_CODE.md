# Sprint 0 — Setup del Monorepo MVP E-commerce

> Este documento es el prompt de arranque para Claude Code en VS Code. Ejecuta exactamente lo que se describe aquí. El documento completo de requerimientos y arquitectura (`REQUERIMIENTOS_TECNICOS_MVP.md`) es la referencia de fondo — este archivo es la instrucción de construcción concreta para el primer sprint.

**Principio de construcción para todo el proyecto:** ante cualquier ambigüedad no cubierta explícitamente aquí, elige siempre la opción más simple y efectiva. No añadas librerías, capas de abstracción, ni patrones (ej. Clean Architecture, DDD, microservicios) que no estén pedidos explícitamente. Si tomas una decisión no especificada, déjala documentada en un comentario breve o en el README.

**Objetivo del Sprint 0:** dejar corriendo en local un backend Express+TypeScript conectado a Postgres vía Prisma, y un frontend React+Vite+Tailwind, comunicándose entre sí mediante un endpoint de salud.

**Prerrequisito (fuera del alcance de Claude Code, lo hace Julio antes de ejecutar este prompt):** crear una cuenta gratuita en [neon.tech](https://neon.tech), crear un proyecto nuevo, y copiar el **connection string** que provee (`postgresql://usuario:password@host/dbname?sslmode=require`). Ese string va en `DATABASE_URL` dentro de `backend/.env`. No se instala Postgres local ni Docker — la base vive en la nube desde este primer sprint.

---

## 1. Estructura de carpetas (monorepo)

```
ecommerce-mvp/
├── README.md
├── .gitignore
├── package.json                 (raíz — scripts para correr ambos proyectos)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       └── lib/api.ts           (cliente fetch centralizado hacia el backend)
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── index.ts             (arranque del servidor Express)
        ├── routes/
        │   └── health.route.ts
        ├── controllers/
        ├── middleware/
        └── lib/prisma.ts        (cliente Prisma singleton)
```

---

## 2. Backend — dependencias y configuración

**`backend/package.json`** debe incluir:
- Dependencias: `express`, `@prisma/client`, `cors`, `dotenv`, `bcrypt`, `jsonwebtoken`
- Dev dependencies: `typescript`, `ts-node-dev`, `prisma`, `@types/express`, `@types/node`, `@types/cors`, `@types/bcrypt`, `@types/jsonwebtoken`
- Scripts:
  - `"dev": "ts-node-dev --respawn src/index.ts"`
  - `"build": "tsc"`
  - `"start": "node dist/index.js"`

**`backend/.env.example`:**
```
# Reemplazar con el connection string real que entrega Neon.tech al crear el proyecto
DATABASE_URL="postgresql://usuario:password@host.neon.tech/ecommerce_mvp?sslmode=require"
JWT_SECRET="cambiar-en-produccion"
PORT=4000
```

**`backend/prisma/schema.prisma`** — modelo inicial según el documento de requerimientos (sección 5), con la versión simplificada del carrito:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  customer
  support
  admin
}

enum OrderStatus {
  pending
  paid
  shipped
  delivered
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  role         Role       @default(customer)
  createdAt    DateTime   @default(now())
  cartItems    CartItem[]
  orders       Order[]
}

model Product {
  id          String      @id @default(uuid())
  name        String
  description String
  price       Decimal
  brand       String
  category    String
  specs       Json
  stock       Int
  imageUrl    String
  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model CartItem {
  id        String  @id @default(uuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int

  @@unique([userId, productId])
}

model Order {
  id         String      @id @default(uuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id])
  status     OrderStatus @default(pending)
  total      Decimal
  trackingId String?     @unique
  createdAt  DateTime    @default(now())
  items      OrderItem[]
  payment    Payment?
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal
}

model Payment {
  id                String   @id @default(uuid())
  orderId           String   @unique
  order             Order    @relation(fields: [orderId], references: [id])
  gatewayReference  String
  status            String
  amount            Decimal
}
```

**`backend/src/index.ts`** debe:
- Levantar Express en el puerto de `.env` (default 4000)
- Habilitar `cors()` (origen: `http://localhost:5173` en dev)
- Habilitar `express.json()`
- Montar la ruta `/api/health` que responde `{ status: "ok", timestamp: <ISO date> }`
- Loggear en consola la URL cuando el servidor arranca

**`backend/src/lib/prisma.ts`**: exportar una única instancia de `PrismaClient` (patrón singleton, para no crear múltiples conexiones en desarrollo con hot-reload).

---

## 3. Frontend — dependencias y configuración

**Generar el proyecto con:** `npm create vite@latest frontend -- --template react-ts`

**Añadir después:**
- `tailwindcss`, `postcss`, `autoprefixer` (configurados según la guía oficial de Tailwind + Vite)
- Configurar la paleta de colores del documento de requerimientos (sección 10) como colores custom en `tailwind.config.js`:
  ```js
  colors: {
    'bg-neutral': '#F2F3F5',      // gris neutro claro
    'text-primary': '#1E293B',    // azul pizarra oscuro
    'accent-blue': '#2563EB',     // azul eléctrico
    'cta-green': '#10B981',       // verde esmeralda — solo para CTAs de compra
  }
  ```

**`frontend/.env.example`:**
```
VITE_API_URL=http://localhost:4000/api
```

**`frontend/src/lib/api.ts`**: cliente `fetch` mínimo que lea `VITE_API_URL` y exponga una función `apiFetch(path, options)` reutilizable (no instalar Axios — `fetch` nativo es suficiente para el MVP).

**`frontend/src/App.tsx`** para el Sprint 0: una pantalla simple que al montar haga `apiFetch('/health')` y muestre el estado de conexión con el backend (texto "Backend conectado ✅" o "Backend no disponible ❌"). Esto sirve como prueba de integración end-to-end del sprint.

---

## 4. Raíz del monorepo

**`package.json`** raíz con `concurrently` como dev dependency, y un script:
```json
"scripts": {
  "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\""
}
```
Así `npm run dev` desde la raíz levanta ambos proyectos con un solo comando.

**`.gitignore`** raíz: `node_modules/`, `dist/`, `.env`, `frontend/.env`, `backend/.env`.

**`README.md`** raíz: instrucciones de instalación (`npm install` en raíz, frontend y backend), cómo crear el proyecto en neon.tech y obtener el connection string, cómo configurar `.env` a partir de `.env.example` con ese string, cómo correr `npx prisma migrate dev` la primera vez, y cómo levantar todo con `npm run dev`.

---

## 5. Definition of Done — Sprint 0

- [ ] `npm run dev` desde la raíz levanta backend (puerto 4000) y frontend (puerto 5173) simultáneamente
- [ ] `GET http://localhost:4000/api/health` responde `200 OK` con JSON
- [ ] La pantalla del frontend muestra "Backend conectado ✅" al cargar
- [ ] `npx prisma migrate dev --name init` corre sin errores contra la base Neon (usando el `DATABASE_URL` real en `.env`) y crea las 6 tablas del esquema
- [ ] El repo tiene `.gitignore` correcto (sin `node_modules` ni `.env` comiteados)
- [ ] README con pasos de instalación reproducibles

**No construyas en este sprint:** autenticación, catálogo, carrito, ni ninguna pantalla más allá del health-check. Eso es Sprint 1 en adelante, según `REQUERIMIENTOS_TECNICOS_MVP.md`.
