# Contexto del Proyecto Refolder

## 📋 Resumen General

**Refolder** es una aplicación SaaS de gestión integral para obras y reformas, construida con Next.js 15, React 19, TypeScript, TailwindCSS y Supabase.

## 🏗️ Stack Tecnológico

- **Frontend:** Next.js 15.1, React 19, TypeScript
- **Estilos:** TailwindCSS 3.4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deployment:** (Pendiente)

## 📁 Estructura del Proyecto

```
refolder/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── callback/route.ts (confirmación de email)
│   │   └── actions.ts
│   ├── dashboard/
│   │   ├── page.tsx (dashboard principal)
│   │   ├── obras/ (proyectos)
│   │   ├── clientes/ (clientes)
│   │   ├── finanzas/ (transacciones financieras)
│   │   ├── presupuestos/
│   │   ├── proveedores/
│   │   ├── empresa/ (gestión de empresa)
│   │   └── admin/roles/ (gestión de roles - sistema antiguo)
│   └── layout.tsx
├── components/
│   ├── auth/ (formularios de login/registro)
│   ├── company/ (gestión de empresa)
│   ├── projects/ (obras/proyectos)
│   ├── clients/ (clientes)
│   ├── finances/ (finanzas)
│   ├── tasks/ (tareas)
│   └── ui/ (componentes shadcn/ui)
├── lib/
│   ├── auth/ (roles y permisos)
│   ├── data/ (funciones de datos)
│   ├── supabase/ (cliente Supabase)
│   └── utils/
├── sql/
│   ├── create_companies_table.sql (EMPRESAS - IMPORTANTE)
│   ├── create_companies_table_FIXED.sql (versión corregida)
│   ├── create_user_roles_table.sql (sistema de roles antiguo)
│   ├── create_finance_transactions_table.sql
│   ├── create_tasks_table.sql
│   ├── create_projects_table.sql
│   ├── STEP_BY_STEP.sql
│   └── QUICK_SETUP.sql
└── .env.local (variables de entorno)
```

## ✅ Funcionalidades Implementadas

### 1. Autenticación
- ✅ Login y registro
- ✅ Confirmación de email
- ✅ Redirección automática después de confirmar email
- ✅ Navegación con Enter entre campos (no borra contenido)

### 2. Sistema de Empresas
- ✅ Creación automática de empresa al registrarse
- ✅ Usuario registrado es dueño y administrador
- ✅ Gestión de administradores y trabajadores
- ✅ Permisos personalizables por trabajador
- ⚠️ **PENDIENTE:** Ejecutar `sql/create_companies_table_FIXED.sql` en Supabase

### 3. Gestión de Proyectos (Obras)
- ✅ CRUD completo de proyectos
- ✅ Asociación con clientes
- ✅ Estados: planificación, en curso, completado, cancelado
- ✅ Fechas, presupuesto, dirección, notas

### 4. Gestión de Clientes
- ✅ CRUD completo de clientes
- ✅ Información completa: nombre, email, teléfono, dirección, CIF/NIF

### 5. Finanzas
- ✅ Transacciones financieras (ingresos/gastos)
- ✅ Asociación con proyectos y clientes
- ✅ Resúmenes financieros por proyecto
- ⚠️ **PENDIENTE:** Ejecutar `sql/create_finance_transactions_table.sql` y `sql/create_clients_table.sql`

### 6. Tareas
- ✅ CRUD completo de tareas
- ✅ Asociación con proyectos
- ✅ Estados: pendiente, en progreso, completado, cancelado
- ✅ Prioridades y horas estimadas/reales

### 7. UI/UX
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Dark mode
- ✅ Tarjetas clickeables (sin botón "Ver Detalles")
- ✅ Navegación mejorada

## ⚠️ Scripts SQL Pendientes de Ejecutar

### CRÍTICO - Ejecutar PRIMERO:
1. **`sql/create_companies_table_FIXED.sql`** - Tabla de empresas y miembros
   - Sin esto, la app no funcionará correctamente
   - Error actual: "Could not find the table 'public.companies'"

### IMPORTANTE:
2. **`sql/create_clients_table.sql`** - Tabla de clientes
3. **`sql/create_finance_transactions_table.sql`** - Tabla de transacciones financieras
   - Requiere que `clients` exista primero

### Ya ejecutados (probablemente):
- `sql/create_projects_table.sql`
- `sql/create_tasks_table.sql`

## 🔧 Configuración Actual

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rnuosfoxruutkmfzwvzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts NPM
```json
{
  "dev": "next dev",
  "dev:network": "next dev -H 0.0.0.0", // Para probar en móvil
  "build": "next build",
  "start": "next start"
}
```

## 🐛 Problemas Conocidos

1. **Tabla companies no existe**
   - Error: "Could not find the table 'public.companies'"
   - Solución: Ejecutar `sql/create_companies_table_FIXED.sql`

2. **Búsqueda de usuarios por email**
   - La función `addCompanyMemberAction` no puede buscar usuarios por email
   - Requiere implementar API de admin de Supabase o función RPC

3. **Error de React en EditProjectForm**
   - ✅ CORREGIDO: Movido setState a useEffect

## 📝 Flujo de Registro Actual

1. Usuario se registra → Ve mensaje: "Ve a tu correo a confirmar"
2. Usuario confirma email → Se crea empresa automáticamente
3. Redirección a login con mensaje de confirmación
4. Usuario inicia sesión → Accede al dashboard

## 🎯 Sistema de Roles y Permisos

### Sistema de Empresas (ACTUAL)
- **Dueño:** Usuario que se registra, administrador completo
- **Administrador:** Puede gestionar trabajadores y permisos
- **Trabajador:** Permisos personalizables por administrador

### Sistema de Roles Antiguo (DEPRECADO)
- Roles: admin, manager, user, viewer
- Archivos en `lib/auth/roles.ts` y `app/dashboard/admin/roles/`
- No se usa actualmente, se reemplazó por sistema de empresas

## 🔐 Permisos de Trabajadores

Los trabajadores pueden tener permisos personalizables:
- `projects:read`, `projects:write`, `projects:delete`
- `clients:read`, `clients:write`, `clients:delete`
- `finances:read`, `finances:write`, `finances:delete`
- `tasks:read`, `tasks:write`, `tasks:delete`

## 📱 Testing en Móvil

- IP local: `192.168.0.21`
- Comando: `npm run dev:network`
- URL móvil: `http://192.168.0.21:3000`
- ⚠️ Actualizar `.env.local`: `NEXT_PUBLIC_APP_URL=http://192.168.0.21:3000`

## 🚀 Próximos Pasos Sugeridos

1. **URGENTE:** Ejecutar `sql/create_companies_table_FIXED.sql` en Supabase
2. Implementar búsqueda de usuarios por email para añadir miembros
3. Completar funcionalidad de proveedores y presupuestos
4. Agregar validaciones adicionales
5. Implementar sistema de notificaciones
6. Agregar reportes y estadísticas

## 📚 Archivos de Documentación

- `ROLES_SETUP.md` - Documentación del sistema de roles (antiguo)
- `EMPRESA_SETUP.md` - Documentación del sistema de empresas
- `MOBILE_TESTING.md` - Guía para probar en móvil

## 🔗 URLs Importantes

- Dashboard: `/dashboard`
- Gestión de Empresa: `/dashboard/empresa`
- Obras: `/dashboard/obras`
- Clientes: `/dashboard/clientes`
- Finanzas: `/dashboard/finanzas`
- Login: `/auth/login`
- Registro: `/auth/register`

## ⚡ Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Desarrollo accesible desde red local (móvil)
npm run dev:network

# Build para producción
npm run build
npm start
```

---

**Última actualización:** Sesión actual
**Estado:** En desarrollo activo
**Prioridad:** Ejecutar scripts SQL pendientes


