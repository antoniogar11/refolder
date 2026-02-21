# CLAUDE.md

## Proyecto

Refolder es una aplicación SaaS de gestión de proyectos de construcción y reformas para pequeños contratistas. Stack: Next.js 15 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Auth), TailwindCSS + shadcn/ui.

## Comandos

```bash
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción
npm run lint         # ESLint
npm run test         # Tests con Vitest
npm run test:watch   # Tests en modo watch
```

## Estructura del proyecto

- `app/` — Rutas (App Router). Las mutaciones van en `actions.ts` con Server Actions ("use server")
- `components/` — Componentes React organizados por dominio (clients/, projects/, estimates/, etc.)
- `components/ui/` — Componentes shadcn/ui (no editar manualmente)
- `lib/` — Lógica de negocio: validaciones Zod (`lib/validations/`), utilidades, clientes Supabase, generación PDF
- `types/index.ts` — Definiciones de tipos centralizadas
- `sql/` — Migraciones SQL para Supabase
- `__tests__/` — Tests unitarios

## Convenciones de código

- **Componentes**: PascalCase (`NewClientForm`). Archivos en kebab-case (`new-client-form.tsx`)
- **Funciones/variables**: camelCase
- **Columnas DB**: snake_case (`user_id`, `created_at`)
- **Lenguaje de dominio en español**: presupuestos, clientes, proyectos, margen, importe
- **Commits en español** siguiendo el formato: `tipo: descripción` (ej. `feat: nueva funcionalidad`, `fix: corrección de bug`)

## Patrones importantes

- **Server Actions** para mutaciones, no API routes. Retornan `FormState` con `status`, `message` y `errors`
- **Zod** para validar todas las entradas. Esquemas en `lib/validations/`
- **`cn()`** de `lib/utils.ts` para clases condicionales de Tailwind (clsx + tailwind-merge)
- **Middleware** (`middleware.ts`) protege rutas `/dashboard/*` y redirige usuarios autenticados fuera de `/auth/*`
- **RLS de Supabase** para aislamiento de datos por usuario

## Servicios externos

- **Supabase**: Base de datos, autenticación y almacenamiento
- **Google Gemini**: Generación de presupuestos con IA
- **Upstash Redis**: Rate limiting
- **Vercel**: Despliegue
