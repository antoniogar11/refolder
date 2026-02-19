# Refolder - SaaS de Gestión para Obras y Reformas

SaaS completo para la gestión integral de obras y reformas, construido con Next.js 15, React 19, TypeScript, TailwindCSS y Supabase.

## Stack Tecnológico

- **Next.js 15.5** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **TailwindCSS 3.4** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI de alta calidad
- **Supabase** - Backend como servicio (auth, base de datos, almacenamiento)
- **Zod 4** - Validación de esquemas
- **Vitest 4** - Testing
- **jsPDF** - Generación de PDFs
- **Google Gemini** - IA para generación de presupuestos
- **Upstash Redis** - Rate limiting

## Estructura del Proyecto

```
refolder/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── clients/
│   │   └── generate-estimate/
│   ├── auth/                     # Autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── dashboard/                # Dashboard principal
│   │   ├── clientes/             # Gestión de clientes
│   │   ├── configuracion/        # Datos de empresa
│   │   ├── presupuestos/         # Presupuestos (zonas + generación IA)
│   │   └── proyectos/            # Proyectos (costes, horas, tareas, ingresos, resumen financiero)
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   ├── not-found.tsx
│   └── globals.css
├── components/                   # Componentes React
│   ├── auth/                     # Login, registro, logout
│   ├── clients/                  # CRUD de clientes
│   ├── dashboard/                # Sidebar, breadcrumbs, paginación, filtros
│   ├── estimates/                # Editor de presupuestos, exportación PDF
│   ├── projects/                 # Gestión de proyectos, tareas y finanzas
│   ├── shared/                   # Componentes reutilizables
│   │   └── zones/                # Zonas con medidas y trabajos (compartido)
│   └── ui/                       # Componentes shadcn/ui
├── lib/                          # Utilidades y lógica de negocio
│   ├── auth/                     # Autenticación
│   ├── data/                     # Acceso a datos (queries)
│   │   └── seed/                 # Datos semilla (precios BCCA)
│   ├── forms/                    # Estado de formularios
│   ├── pdf/                      # Generación de PDFs
│   ├── supabase/                 # Clientes Supabase (client, server, admin)
│   ├── utils/                    # Formato, errores, validación
│   └── validations/              # Esquemas Zod por entidad
├── types/                        # Tipos TypeScript
├── __tests__/                    # Tests unitarios
├── docs/                         # Documentación del proyecto
├── scripts/                      # Scripts de setup de BD
├── sql/                          # Migraciones SQL
├── supabase/                     # Migraciones de Supabase
└── public/                       # Archivos estáticos (PWA)
```

## Funcionalidades Principales

- **Presupuestos con IA** - Crea presupuestos añadiendo zonas (Baño, Cocina, Salón...) con medidas y tipos de trabajo, y genera partidas detalladas con IA (Google Gemini). Vista previa editable con márgenes y precios. Filtros por estado (borrador, enviado, aceptado, rechazado).
- **Proyectos** - Gestión de obras con seguimiento financiero: gastos, ingresos, horas de mano de obra, tareas y resumen financiero global (presupuestado, gastado, cobrado, beneficio). Filtros por estado. Creación de proyecto desde presupuesto con generación automática de tareas.
- **Tareas de proyecto** - Sistema de tareas por proyecto con estados (pendiente, en progreso, completada). Las horas se pueden asignar a tareas específicas.
- **Clientes** - CRUD completo con historial de presupuestos y proyectos asociados.
- **PDF profesional** - Exportación de presupuestos en PDF con datos de empresa personalizables.
- **Configuración** - Datos de empresa (nombre, CIF, dirección, logo) para personalizar los PDFs.
- **PWA** - Instalable como app nativa en móvil y escritorio.

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Edita `.env.local` con tus credenciales:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# Google Gemini (IA para generar presupuestos)
GEMINI_API_KEY=tu_api_key_de_gemini
GEMINI_MODEL=gemini-2.5-flash

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=tu_url_de_upstash
UPSTASH_REDIS_REST_TOKEN=tu_token_de_upstash

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run test` - Ejecuta los tests con Vitest
- `npm run test:watch` - Ejecuta los tests en modo watch

## Configuración de Supabase

Este proyecto utiliza Supabase para:
- Autenticación de usuarios
- Base de datos PostgreSQL
- Almacenamiento de archivos
- Row Level Security (RLS)

Las migraciones se gestionan en `supabase/migrations/`. La documentación de setup está en `docs/setup/`.

## Componentes UI

El proyecto utiliza shadcn/ui para los componentes. Para agregar nuevos componentes:

```bash
npx shadcn@latest add [component-name]
```

## Personalización

Los estilos se pueden personalizar en:
- `app/globals.css` - Variables CSS y estilos globales
- `tailwind.config.ts` - Configuración de TailwindCSS (dark mode, colores brand)

## Documentación

Consulta la carpeta `docs/` para guías detalladas:
- `docs/setup/` - Configuración de entorno, empresa
- `docs/deploy/` - Guía de despliegue
- `docs/git/` - Flujo de trabajo Git
- `docs/troubleshooting/` - FAQ de errores comunes

## Licencia

Este proyecto es privado y confidencial.
