# Refolder

SaaS de gestión de proyectos de construcción/reformas.

**Directorio del proyecto:** `/Users/macdeantonio/Documents/GitHub/refolder` (es el único, no usar otros paths)

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5
- **DB:** Supabase (PostgreSQL) - queries directas, sin ORM
- **Auth:** Supabase Auth (email/password) + middleware
- **Estilos:** TailwindCSS 3.4 + shadcn/ui (New York) + Lucide icons
- **IA:** Google Gemini (gemini-2.5-flash) para generar presupuestos
- **PDF:** jsPDF + jsPDF-autotable
- **Rate limiting:** Upstash Redis
- **Validación:** Zod 4
- **Tests:** Vitest + Testing Library

## Comandos

```bash
npm run dev          # Servidor desarrollo (localhost:3000)
npm run build        # Build producción
npm run test         # Tests con Vitest
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint
```

## Estructura

```
app/
├── api/                          # Route handlers (Gemini, clients)
├── auth/                         # Login, registro, reset password
├── dashboard/
│   ├── clientes/                 # CRUD clientes
│   ├── presupuestos/             # Presupuestos con IA
│   ├── proyectos/                # Proyectos + tareas + horas + costes
│   └── configuracion/            # Config empresa
├── presupuesto/[token]/          # Portal público de presupuestos
components/
├── auth/, clients/, company/, estimates/, projects/  # Por feature
├── shared/zones/                 # Editor de zonas compartido
├── ui/                           # shadcn/ui base
lib/
├── data/                         # Queries a Supabase (capa de datos)
├── validations/                  # Schemas Zod
├── forms/                        # Form state utilities
├── supabase/                     # Clients: server.ts, client.ts, admin.ts
├── pdf/                          # Generación PDF
├── utils/                        # Formateo, validación, helpers
types/index.ts                    # Tipos TypeScript centralizados
sql/                              # Migraciones SQL
```

## Convenciones

- **Idioma:** Todo en español (rutas, UI, variables de negocio)
- **Mutaciones:** Server Actions (`"use server"`) en archivos `actions.ts`
- **Datos:** Queries en `lib/data/*.ts`, nunca llamar Supabase directo desde componentes
- **Validación:** Zod schema → FormState para errores
- **Componentes:** kebab-case para archivos, PascalCase para exports
- **Paginación:** PAGE_SIZE = 20, con `.range()`
- **Errores:** `throwQueryError()` utility en `lib/errors.ts`

## Patrones clave

- RLS activado en Supabase. Admin client (`lib/supabase/admin.ts`) para bypass en rutas públicas
- Middleware protege `/dashboard` (requiere auth) y redirige `/auth` si ya logueado
- Al registrarse, se crea empresa automáticamente
- Presupuestos compartibles vía token público (`/presupuesto/[token]`)
- Precios del usuario se aprenden en `user_precios` (full-text search español)
- Rate limiting: 50 req/hora por usuario en llamadas a Gemini

## Tablas principales

companies, clients, projects, estimates, estimate_items, project_tasks,
project_hours, project_costs, worker_rates, work_types, finance_transactions,
precios_referencia, user_precios
