# Refolder - Documentacion del Proyecto

## Tabla de Contenidos - Documentacion

| Documento | Descripcion |
|-----------|-------------|
| [deploy/GUIA_DEPLOY.md](deploy/GUIA_DEPLOY.md) | Guia completa de deploy en Vercel y otras plataformas |
| [git/GUIA_GIT.md](git/GUIA_GIT.md) | Como hacer push a GitHub (terminal y GitHub Desktop) |
| [setup/EMPRESA_SETUP.md](setup/EMPRESA_SETUP.md) | Configuracion del sistema de empresas |
| [setup/ROLES_SETUP.md](setup/ROLES_SETUP.md) | Configuracion del sistema de roles y permisos |
| [setup/DESARROLLO_LOCAL_VS_PRODUCCION.md](setup/DESARROLLO_LOCAL_VS_PRODUCCION.md) | Diferencias entre entorno local y produccion |
| [troubleshooting/FAQ_ERRORES.md](troubleshooting/FAQ_ERRORES.md) | Errores comunes y sus soluciones |
| [RECOMENDACIONES_FUNCIONALIDADES.md](RECOMENDACIONES_FUNCIONALIDADES.md) | Recomendaciones de funcionalidades futuras |
| [MOBILE_TESTING.md](MOBILE_TESTING.md) | Guia para probar en movil |
| [ANALISIS_FACTURACION.md](ANALISIS_FACTURACION.md) | Analisis del modulo de facturacion |

---

## Resumen General

**Refolder** es una aplicacion SaaS de gestion integral para obras y reformas, construida con Next.js 15, React 19, TypeScript, TailwindCSS y Supabase.

- **Proyecto**: Refolder - SaaS de Gestion para Obras y Reformas
- **Stack**: Next.js 15.1, React 19, TypeScript, TailwindCSS, Supabase
- **Repositorio**: https://github.com/antoniogar11/refolder

## Stack Tecnologico

- **Frontend:** Next.js 15.1, React 19, TypeScript
- **Estilos:** TailwindCSS 3.4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deployment:** Vercel

## Estructura del Proyecto

```
refolder/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── callback/route.ts (confirmacion de email)
│   │   └── actions.ts
│   ├── dashboard/
│   │   ├── page.tsx (dashboard principal)
│   │   ├── obras/ (proyectos)
│   │   ├── clientes/ (clientes)
│   │   ├── finanzas/ (transacciones financieras)
│   │   ├── presupuestos/
│   │   ├── proveedores/
│   │   ├── empresa/ (gestion de empresa)
│   │   └── admin/roles/ (gestion de roles - sistema antiguo)
│   └── layout.tsx
├── components/
│   ├── auth/ (formularios de login/registro)
│   ├── company/ (gestion de empresa)
│   ├── projects/ (obras/proyectos)
│   ├── clients/ (clientes)
│   ├── finances/ (finanzas)
│   ├── tasks/ (tareas)
│   ├── layout/ (sidebar y navegacion)
│   └── ui/ (componentes shadcn/ui)
├── lib/
│   ├── auth/ (roles y permisos)
│   ├── data/ (funciones de datos)
│   ├── supabase/ (cliente Supabase)
│   ├── forms/ (tipos y estados de formularios)
│   └── utils/ (formateo, validacion, errores)
├── sql/
│   ├── create_companies_table.sql
│   ├── create_companies_table_FIXED.sql
│   ├── create_user_roles_table.sql
│   ├── create_finance_transactions_table.sql
│   ├── create_tasks_table.sql
│   ├── create_projects_table.sql
│   ├── STEP_BY_STEP.sql
│   └── QUICK_SETUP.sql
└── .env.local (variables de entorno)
```

## Estado Actual

### Funcionalidades Completadas

#### Autenticacion
- Login y registro funcionales con Supabase Auth
- Confirmacion de email
- Proteccion de rutas del dashboard
- Server actions para autenticacion
- Logout funcional

#### Base de Datos (Supabase)
- Tablas creadas: `clients`, `suppliers`, `projects`, `tasks`, `estimates`, `finance_transactions`
- RLS (Row Level Security) configurado para todas las tablas
- Politicas de seguridad implementadas

#### Clientes (CRUD Completo)
- Lista de clientes en tabla clickeable
- Crear, editar y eliminar cliente (con confirmacion)
- Campos: nombre, email, telefono, direccion, poblacion, provincia, codigo postal, CIF/NIF, notas
- Formulario de creacion solo visible al hacer clic en boton

#### Obras/Proyectos (CRUD Completo)
- Lista de obras en cards clickeables
- Crear, editar y eliminar obra (con confirmacion)
- Relacion con clientes (asignacion opcional)
- Campos: nombre, cliente, descripcion, estado, fechas (inicio/fin), presupuesto, direccion, notas
- Estados: Planificacion, En Curso, Completado, Cancelado
- Vista de solo lectura por defecto, formulario de edicion al hacer clic

#### Tareas de Obras (CRUD Completo)
- Lista de tareas por proyecto
- Crear, editar (inline) y eliminar tarea
- Campos: titulo, descripcion, estado, prioridad, fecha de vencimiento, asignado a, horas estimadas/reales, notas
- Estados: Pendiente, En Progreso, Completada, Cancelada
- Prioridades: Baja, Media, Alta, Urgente
- Auto-completado: fecha de completado automatica

#### Finanzas (CRUD Completo)
- Lista de transacciones financieras
- Tipos: Ingresos y Gastos
- Categorias predefinidas para ingresos y gastos
- Metodos de pago: Efectivo, Transferencia, Tarjeta, Cheque, Otro
- Relaciones: Asignacion opcional a obras y clientes
- Resumen financiero: Totales de ingresos, gastos y balance
- Resumen mensual: Totales del mes actual
- Finanzas por proyecto: Cada proyecto tiene su propia seccion de finanzas

#### Sistema de Empresas
- Creacion automatica de empresa al registrarse
- Usuario registrado es dueno y administrador
- Gestion de administradores y trabajadores
- Permisos personalizables por trabajador

#### UI/UX
- Diseno responsive (movil, tablet, desktop)
- Dark mode
- Tarjetas clickeables
- Formularios ocultos por defecto, se muestran con botones
- Sidebar lateral (visible en apartados, oculto en dashboard principal)
- Utilidades comunes: formateo, validacion, manejo de errores

### Pendiente / Por Implementar

#### Modulos sin CRUD
- **Presupuestos**: Solo UI estatica
- **Proveedores**: Solo UI estatica

#### Funcionalidades Faltantes
- Relaciones entre entidades (presupuestos <-> obras, etc.)
- Busqueda y filtros en listas
- Paginacion
- Exportacion de datos
- Reportes y estadisticas
- Notificaciones
- Subida de archivos/documentos

### Accion Urgente Requerida

**Ejecutar este script SQL en Supabase:**
- Archivo: `sql/create_companies_table_FIXED.sql`
- Sin esto, la app mostrara error: "Could not find the table 'public.companies'"

### Scripts SQL Pendientes de Ejecutar

#### CRITICO - Ejecutar PRIMERO:
1. **`sql/create_companies_table_FIXED.sql`** - Tabla de empresas y miembros

#### IMPORTANTE:
2. **`sql/create_clients_table.sql`** - Tabla de clientes
3. **`sql/create_finance_transactions_table.sql`** - Tabla de transacciones financieras (requiere que `clients` exista primero)

## Sistema de Roles y Permisos

### Sistema de Empresas (ACTUAL)
- **Dueno:** Usuario que se registra, administrador completo
- **Administrador:** Puede gestionar trabajadores y permisos
- **Trabajador:** Permisos personalizables por administrador

### Sistema de Roles Antiguo (DEPRECADO)
- Roles: admin, manager, user, viewer
- Archivos en `lib/auth/roles.ts` y `app/dashboard/admin/roles/`
- No se usa actualmente, se reemplazo por sistema de empresas

### Permisos de Trabajadores
- `projects:read`, `projects:write`, `projects:delete`
- `clients:read`, `clients:write`, `clients:delete`
- `finances:read`, `finances:write`, `finances:delete`
- `tasks:read`, `tasks:write`, `tasks:delete`

## Flujo de Registro

1. Usuario se registra -> Ve mensaje: "Ve a tu correo a confirmar"
2. Usuario confirma email -> Se crea empresa automaticamente
3. Redireccion a login con mensaje de confirmacion
4. Usuario inicia sesion -> Accede al dashboard

## Configuracion

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rnuosfoxruutkmfzwvzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurado]
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=[configurado]
GEMINI_API_KEY=[opcional]
```

### Scripts NPM
```json
{
  "dev": "next dev",
  "dev:network": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "next start"
}
```

## Testing en Movil

- IP local: `192.168.0.21`
- Comando: `npm run dev:network`
- URL movil: `http://192.168.0.21:3000`
- Actualizar `.env.local`: `NEXT_PUBLIC_APP_URL=http://192.168.0.21:3000`

## URLs Importantes

- Dashboard: `/dashboard`
- Gestion de Empresa: `/dashboard/empresa`
- Obras: `/dashboard/obras`
- Clientes: `/dashboard/clientes`
- Finanzas: `/dashboard/finanzas`
- Login: `/auth/login`
- Registro: `/auth/register`

## Comandos Utiles

```bash
# Desarrollo local
npm run dev

# Desarrollo accesible desde red local (movil)
npm run dev:network

# Build para produccion
npm run build
npm start
```

## Notas Tecnicas

- Usa `useActionState` (React 19) para formularios
- Server actions en archivos `actions.ts` con `"use server"`
- RLS en Supabase asegura que cada usuario solo vea sus datos
- Validacion de formularios en server actions
- Revalidacion de rutas con `revalidatePath` despues de mutaciones
- **Patron de UI**: Formularios ocultos por defecto, se muestran con botones para mejor UX
- **Sincronizacion**: Las transacciones financieras se sincronizan automaticamente entre la vista general y la vista del proyecto

## Proximos Pasos Sugeridos

1. **URGENTE:** Ejecutar `sql/create_companies_table_FIXED.sql` en Supabase
2. Implementar CRUD de Presupuestos (con relacion a obras y clientes)
3. Implementar CRUD de Proveedores
4. Implementar busqueda de usuarios por email para anadir miembros
5. Agregar busqueda y filtros en listas
6. Implementar paginacion
7. Agregar exportacion de datos
8. Implementar reportes y estadisticas
9. Agregar sistema de notificaciones
