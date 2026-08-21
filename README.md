# Ecommerce MVP

Monorepo con `frontend` (React + Vite + Tailwind) y `backend` (Express + TypeScript + Prisma), conectado a una base de datos Postgres en la nube (Neon.tech).

## 1. Instalación

Instala dependencias en la raíz, en `frontend` y en `backend`:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

## 2. Crear la base de datos en Neon.tech

1. Crea una cuenta gratuita en [neon.tech](https://neon.tech).
2. Crea un proyecto nuevo.
3. Copia el **connection string** que te entrega Neon (formato `postgresql://usuario:password@host/dbname?sslmode=require`).

## 3. Configurar variables de entorno

Copia los archivos de ejemplo y complétalos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

En `backend/.env`, reemplaza `DATABASE_URL` con el connection string real de Neon, y ajusta `JWT_SECRET` si quieres. `frontend/.env` ya trae el valor por defecto correcto para desarrollo local.

## 4. Crear las tablas en la base de datos

Con `DATABASE_URL` ya configurado en `backend/.env`:

```bash
cd backend
npx prisma migrate dev --name init
```

Esto crea las 6 tablas del esquema (`User`, `Product`, `CartItem`, `Order`, `OrderItem`, `Payment`) en la base de Neon.

## 5. Levantar el proyecto

Desde la raíz:

```bash
npm run dev
```

Esto levanta el backend en `http://localhost:4000` y el frontend en `http://localhost:5173` al mismo tiempo.

- Backend health check: `GET http://localhost:4000/api/health`
- Frontend: abre `http://localhost:5173` — debe mostrar "Backend conectado ✅"

## Notas de decisiones no especificadas

- Se fijó `tailwindcss` en versión 3.x (en vez de la 4.x que instala `npm create vite` por defecto) porque el prompt del Sprint 0 pide explícitamente el patrón clásico `tailwind.config.js` + `postcss.config.js` + `autoprefixer`, propio de Tailwind v3.
