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
  - `projects` (con campo `address` agregado)
  - `tasks` (tareas de obras)
  - `estimates`
  - `finance_transactions` (transacciones financieras)
- ✅ RLS (Row Level Security) configurado para todas las tablas
- ✅ Políticas de seguridad implementadas

#### Clientes (CRUD Completo)
- ✅ Lista de clientes en tabla clickeable
- ✅ Crear cliente (formulario oculto por defecto, se muestra con botón)
- ✅ Editar cliente (página `/dashboard/clientes/[id]`)
- ✅ Eliminar cliente (con confirmación)
- ✅ Campos: nombre, email, teléfono, dirección, población, provincia, código postal, CIF/NIF, notas
- ✅ UI mejorada: formulario de creación solo visible al hacer clic en botón

#### Obras/Proyectos (CRUD Completo)
- ✅ Lista de obras en cards clickeables
- ✅ Crear obra (formulario oculto por defecto, se muestra con botón)
- ✅ Editar obra (página `/dashboard/obras/[id]`)
  - ✅ Vista de solo lectura por defecto
  - ✅ Formulario de edición se muestra al hacer clic en "Editar Obra"
- ✅ Eliminar obra (con confirmación)
- ✅ Relación con clientes (asignación opcional)
- ✅ Campos: nombre, cliente, descripción, estado, fechas (inicio/fin), presupuesto, dirección, notas
- ✅ Estados: Planificación, En Curso, Completado, Cancelado

#### Tareas de Obras (CRUD Completo)
- ✅ Lista de tareas por proyecto
- ✅ Crear tarea (formulario oculto por defecto, se muestra con botón)
- ✅ Editar tarea (edición inline en la lista)
- ✅ Eliminar tarea (con confirmación)
- ✅ Campos: título, descripción, estado, prioridad, fecha de vencimiento, asignado a, horas estimadas/reales, notas
- ✅ Estados: Pendiente, En Progreso, Completada, Cancelada
- ✅ Prioridades: Baja, Media, Alta, Urgente
- ✅ Auto-completado: fecha de completado automática al marcar como completada

#### Finanzas (CRUD Completo)
- ✅ Lista de transacciones financieras
- ✅ Crear transacción (formulario oculto por defecto, se muestra con botón)
- ✅ Editar transacción (página `/dashboard/finanzas/[id]`)
- ✅ Eliminar transacción (con confirmación)
- ✅ Tipos: Ingresos y Gastos
- ✅ Categorías predefinidas para ingresos y gastos
- ✅ Métodos de pago: Efectivo, Transferencia, Tarjeta, Cheque, Otro
- ✅ Relaciones: Asignación opcional a obras y clientes
- ✅ Resumen financiero: Totales de ingresos, gastos y balance
- ✅ Resumen mensual: Totales del mes actual
- ✅ **Finanzas por proyecto**: Cada proyecto tiene su propia sección de finanzas
  - ✅ Resumen financiero del proyecto (ingresos, gastos, balance)
  - ✅ Formulario para crear transacciones con proyecto y cliente pre-seleccionados
  - ✅ Lista de transacciones del proyecto
  - ✅ Sincronización automática con la página general de finanzas

#### UI/UX
- ✅ Diseño moderno con TailwindCSS y shadcn/ui
- ✅ Página principal mejorada con hero section
- ✅ Componentes UI: Button, Card, etc.
- ✅ Dark mode soportado
- ✅ **Mejoras de UX**: Formularios ocultos por defecto, solo se muestran al hacer clic en botones
  - ✅ Formulario de creación de proyectos
  - ✅ Formulario de creación de clientes
  - ✅ Formulario de edición de obras (vista de solo lectura por defecto)
  - ✅ Formulario de creación de tareas dentro de proyectos
  - ✅ Formulario de creación de transacciones dentro de proyectos

### 🚧 Pendiente / Por Implementar

#### Módulos sin CRUD
- ⏳ **Presupuestos**: Solo UI estática
- ⏳ **Proveedores**: Solo UI estática

#### Funcionalidades Faltantes
- ⏳ Relaciones entre entidades (presupuestos ↔ obras, etc.)
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
    /obras
      page.tsx - Lista de obras (cards)
      /[id]
        page.tsx - Edición de obra (con tareas y finanzas)
        /tasks
          actions.ts - Server actions CRUD tareas
      actions.ts - Server actions CRUD obras
    /finanzas
      page.tsx - Lista de transacciones y resumen
      /[id]
        page.tsx - Edición de transacción
      actions.ts - Server actions CRUD finanzas
    /presupuestos - Solo UI estática
    /proveedores - Solo UI estática
    layout.tsx - Protección de rutas

/components
  /auth - Formularios de autenticación
  /clients - Componentes de clientes
    new-client-form.tsx
    new-client-section.tsx - Maneja mostrar/ocultar formulario
    edit-client-form.tsx
    delete-client-button.tsx
  /projects - Componentes de obras
    new-project-form.tsx
    new-project-section.tsx - Maneja mostrar/ocultar formulario
    edit-project-form.tsx
    edit-project-section.tsx - Vista de solo lectura y edición
    delete-project-button.tsx
  /tasks - Componentes de tareas
    new-task-form.tsx
    new-task-section.tsx - Maneja mostrar/ocultar formulario
    edit-task-form.tsx
    tasks-list.tsx - Lista con edición inline
  /finances - Componentes de finanzas
    new-transaction-form.tsx
    new-transaction-section.tsx - Maneja mostrar/ocultar formulario
    edit-transaction-form.tsx
    transactions-list.tsx
    delete-transaction-button.tsx
    project-finances.tsx - Finanzas específicas de un proyecto
  /ui - Componentes shadcn/ui

/lib
  /data
    clients.ts - Funciones de acceso a datos de clientes
    projects.ts - Funciones de acceso a datos de obras
    tasks.ts - Funciones de acceso a datos de tareas
    finances.ts - Funciones de acceso a datos de finanzas
  /supabase
    client.ts - Cliente Supabase (browser)
    server.ts - Cliente Supabase (server)
  /forms
    client-form-state.ts - Tipos y estados de formularios
    project-form-state.ts - Tipos y estados de formularios de obras
    task-form-state.ts - Tipos y estados de formularios de tareas
    finance-form-state.ts - Tipos y estados de formularios de finanzas

/sql
  add_client_fields.sql - Script para agregar campos a clients
  create_projects_table.sql - Script para crear tabla projects
  add_projects_address_column.sql - Script para agregar columna address
  create_tasks_table.sql - Script para crear tabla tasks
  create_finance_transactions_table.sql - Script para crear tabla finance_transactions
```

## Variables de Entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://rnuosfoxruutkmfzwvzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurado]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts SQL Pendientes de Ejecutar

⚠️ **IMPORTANTE**: Ejecutar estos scripts en Supabase si aún no se han ejecutado:

1. `sql/create_projects_table.sql` - Crear tabla de proyectos
2. `sql/add_projects_address_column.sql` - Agregar columna address a projects
3. `sql/create_tasks_table.sql` - Crear tabla de tareas
4. `sql/create_finance_transactions_table.sql` - Crear tabla de transacciones financieras

## Próximos Pasos Sugeridos
1. Implementar CRUD de Presupuestos (con relación a obras y clientes)
2. Implementar CRUD de Proveedores
3. Añadir búsqueda y filtros en listas
4. Implementar paginación
5. Añadir exportación de datos
6. Implementar reportes y estadísticas

## Notas Técnicas
- Usa `useActionState` (React 19) para formularios
- Server actions en archivos `actions.ts` con `"use server"`
- RLS en Supabase asegura que cada usuario solo vea sus datos
- Validación de formularios en server actions
- Revalidación de rutas con `revalidatePath` después de mutaciones
- **Patrón de UI**: Formularios ocultos por defecto, se muestran con botones para mejor UX
- **Sincronización**: Las transacciones financieras se sincronizan automáticamente entre la vista general y la vista del proyecto

## Cambios Recientes (Última Sesión)

### Mejoras de UX Implementadas
- ✅ Formularios de creación ocultos por defecto (proyectos, clientes, tareas, transacciones)
- ✅ Vista de solo lectura para edición de obras (formulario se muestra al hacer clic en "Editar")
- ✅ Botones de cancelar en todos los formularios
- ✅ Ocultación automática de formularios después de crear/editar exitosamente

### Funcionalidades Agregadas
- ✅ Sistema completo de tareas para obras
- ✅ Sistema completo de finanzas (ingresos/gastos)
- ✅ Finanzas por proyecto (cada proyecto tiene su propia sección financiera)
- ✅ Sincronización automática entre finanzas generales y finanzas del proyecto

### Archivos Nuevos Creados
- `components/projects/new-project-section.tsx`
- `components/projects/edit-project-section.tsx`
- `components/clients/new-client-section.tsx`
- `components/tasks/new-task-section.tsx`
- `components/tasks/edit-task-form.tsx`
- `components/tasks/tasks-list.tsx`
- `components/finances/new-transaction-section.tsx`
- `components/finances/project-finances.tsx`
- `components/finances/transactions-list.tsx`
- `components/finances/edit-transaction-form.tsx`
- `components/finances/delete-transaction-button.tsx`
- `lib/data/tasks.ts`
- `lib/data/finances.ts`
- `lib/forms/task-form-state.ts`
- `lib/forms/finance-form-state.ts`
- `app/dashboard/obras/[id]/tasks/actions.ts`
- `app/dashboard/finanzas/actions.ts`
- `app/dashboard/finanzas/[id]/page.tsx`
- `sql/create_tasks_table.sql`
- `sql/create_finance_transactions_table.sql`
