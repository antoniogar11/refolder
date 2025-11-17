# Estado del Proyecto Refolder

## Información General
- **Proyecto**: Refolder - SaaS de Gestión para Obras y Reformas
- **Stack**: Next.js 15.1, React 19, TypeScript, TailwindCSS, Supabase
- **Ubicación**: `/Users/macdeantonio/Refolder/refolder`
- **Supabase URL**: `https://rnuosfoxruutkmfzwvzr.supabase.co`

## Estado Actual

### ✅ Completado

#### Autenticación
- ✅ Login y registro funcionales con Supabase Auth
- ✅ Protección de rutas del dashboard
- ✅ Server actions para autenticación
- ✅ Componentes de formularios (LoginForm, RegisterForm)
- ✅ Logout funcional

#### Base de Datos (Supabase)
- ✅ Tablas creadas:
  - `clients` (con campos: name, email, phone, address, city, province, postal_code, tax_id, notes)
  - `suppliers`
  - `projects`
  - `estimates`
  - `finance_transactions`
- ✅ RLS (Row Level Security) configurado para todas las tablas
- ✅ Políticas de seguridad implementadas

#### Clientes (CRUD Completo)
- ✅ Lista de clientes en tabla clickeable
- ✅ Crear cliente (formulario completo con validación)
- ✅ Editar cliente (página `/dashboard/clientes/[id]`)
- ✅ Eliminar cliente (con confirmación)
- ✅ Campos: nombre, email, teléfono, dirección, población, provincia, código postal, CIF/NIF, notas

#### UI/UX
- ✅ Diseño moderno con TailwindCSS y shadcn/ui
- ✅ Página principal mejorada con hero section
- ✅ Componentes UI: Button, Card, etc.
- ✅ Dark mode soportado

### 🚧 Pendiente / Por Implementar

#### Módulos sin CRUD
- ⏳ **Obras/Proyectos**: Solo UI estática
- ⏳ **Presupuestos**: Solo UI estática
- ⏳ **Proveedores**: Solo UI estática
- ⏳ **Finanzas**: Solo UI estática

#### Funcionalidades Faltantes
- ⏳ Relaciones entre entidades (obras ↔ clientes, presupuestos ↔ obras, etc.)
- ⏳ Búsqueda y filtros en listas
- ⏳ Paginación
- ⏳ Exportación de datos
- ⏳ Reportes y estadísticas
- ⏳ Notificaciones
- ⏳ Subida de archivos/documentos

## Estructura de Archivos Importante

```
/app
  /auth
    /login - Página de login
    /register - Página de registro
    actions.ts - Server actions de autenticación
  /dashboard
    /clientes
      page.tsx - Lista de clientes (tabla)
      /[id]
        page.tsx - Edición de cliente
      actions.ts - Server actions CRUD clientes
    /obras - Solo UI estática
    /presupuestos - Solo UI estática
    /proveedores - Solo UI estática
    /finanzas - Solo UI estática
    layout.tsx - Protección de rutas

/components
  /auth - Formularios de autenticación
  /clients - Componentes de clientes
    new-client-form.tsx
    edit-client-form.tsx
    delete-client-button.tsx
  /ui - Componentes shadcn/ui

/lib
  /data
    clients.ts - Funciones de acceso a datos de clientes
  /supabase
    client.ts - Cliente Supabase (browser)
    server.ts - Cliente Supabase (server)
  /forms
    client-form-state.ts - Tipos y estados de formularios
```

## Variables de Entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://rnuosfoxruutkmfzwvzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurado]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Próximos Pasos Sugeridos
1. Implementar CRUD completo de Obras/Proyectos
2. Implementar CRUD de Presupuestos (con relación a obras y clientes)
3. Implementar CRUD de Proveedores
4. Implementar gestión de Finanzas (ingresos/gastos)
5. Añadir búsqueda y filtros
6. Implementar relaciones entre entidades

## Notas Técnicas
- Usa `useActionState` (React 19) para formularios
- Server actions en archivos `actions.ts` con `"use server"`
- RLS en Supabase asegura que cada usuario solo vea sus datos
- Validación de formularios en server actions
- Revalidación de rutas con `revalidatePath` después de mutaciones

