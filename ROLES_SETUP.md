# Sistema de Roles - Guía de Configuración

## 📋 Descripción

Se ha implementado un sistema completo de roles y permisos para la aplicación Refolder. El sistema incluye 4 roles predefinidos con diferentes niveles de acceso.

## 🎭 Roles Disponibles

### 1. **Admin** (Administrador)
- **Acceso completo** al sistema
- Puede gestionar usuarios y roles
- Puede crear, editar y eliminar todos los recursos
- **Permisos**: Todos los permisos del sistema

### 2. **Manager** (Gestor)
- Puede gestionar proyectos, clientes y finanzas
- No puede gestionar usuarios ni roles
- **Permisos**: 
  - Proyectos: leer, escribir, eliminar
  - Clientes: leer, escribir, eliminar
  - Finanzas: leer, escribir, eliminar
  - Tareas: leer, escribir, eliminar

### 3. **User** (Usuario)
- Puede ver y editar sus propios proyectos y recursos
- **Permisos**:
  - Proyectos: leer, escribir
  - Clientes: leer, escribir
  - Finanzas: leer, escribir
  - Tareas: leer, escribir

### 4. **Viewer** (Visualizador)
- Solo puede ver información
- No puede crear ni editar recursos
- **Permisos**: Solo lectura en todos los recursos

## 🚀 Instalación

### Paso 1: Crear la tabla de roles

Ejecuta el siguiente script SQL en Supabase:

```sql
-- El script está en: sql/create_user_roles_table.sql
```

O copia y pega el contenido del archivo `sql/create_user_roles_table.sql` en el SQL Editor de Supabase.

### Paso 2: Asignar rol admin al primer usuario

Después de crear la tabla, asigna el rol de admin a tu usuario:

```sql
-- Reemplaza 'TU_USER_ID' con tu ID de usuario de Supabase
INSERT INTO public.user_roles (user_id, role) 
VALUES ('TU_USER_ID', 'admin')
ON CONFLICT (user_id) DO NOTHING;
```

Para obtener tu user_id:
1. Ve a Supabase Dashboard > Authentication > Users
2. Copia el UUID del usuario

### Paso 3: Verificar la instalación

1. Inicia sesión en la aplicación
2. Ve a `/dashboard/admin/roles` (solo si eres admin)
3. Deberías ver la página de gestión de roles

## 📁 Archivos Creados

### Base de Datos
- `sql/create_user_roles_table.sql` - Script SQL para crear la tabla de roles

### Librerías
- `lib/auth/roles.ts` - Funciones para gestionar roles y permisos
- `lib/auth/require-role.ts` - Middleware para proteger rutas por rol

### Componentes
- `components/admin/change-role-form.tsx` - Formulario para cambiar roles

### Páginas
- `app/dashboard/admin/roles/page.tsx` - Página de gestión de roles (solo admin)

### Acciones
- `app/dashboard/admin/roles/actions.ts` - Server actions para gestionar roles

## 🔒 Uso del Sistema de Roles

### Proteger una página por rol

```typescript
import { requireRole } from '@/lib/auth/require-role';

export default async function AdminPage() {
  // Solo admins pueden acceder
  const { user, role } = await requireRole(['admin']);
  
  // Tu código aquí
}
```

### Verificar permisos

```typescript
import { userHasPermission } from '@/lib/auth/roles';

const canEdit = await userHasPermission(userId, 'projects:write');
if (canEdit) {
  // Permitir edición
}
```

### Obtener el rol de un usuario

```typescript
import { getUserRole } from '@/lib/auth/roles';

const role = await getUserRole(userId);
// Retorna: 'admin' | 'manager' | 'user' | 'viewer' | null
```

## 🔐 Políticas RLS

Las políticas RLS (Row Level Security) en Supabase ya están configuradas para que los usuarios solo vean sus propios datos. El sistema de roles se puede extender para:

1. Permitir que managers vean todos los proyectos
2. Permitir que admins vean todos los datos
3. Restringir acciones según el rol

## 📝 Notas Importantes

1. **Rol por defecto**: Los nuevos usuarios reciben automáticamente el rol 'user'
2. **Primer admin**: Debes asignar manualmente el rol 'admin' al primer usuario
3. **Seguridad**: Las políticas RLS protegen los datos a nivel de base de datos
4. **Permisos**: Los permisos se verifican tanto en el servidor como en el cliente

## 🛠️ Personalización

### Agregar un nuevo rol

1. Edita `lib/auth/roles.ts`:
   - Agrega el rol al tipo `UserRole`
   - Agrega la configuración en el objeto `ROLES`
   - Define los permisos del rol

2. Actualiza la tabla SQL:
   - Modifica el CHECK constraint en `create_user_roles_table.sql`

3. Ejecuta la migración SQL

### Agregar un nuevo permiso

1. Edita `lib/auth/roles.ts`:
   - Agrega el permiso a los roles correspondientes en el array `permissions`

2. Usa el permiso en tu código:
   ```typescript
   await userHasPermission(userId, 'nuevo_recurso:write');
   ```

## 🐛 Solución de Problemas

### Error: "Insufficient permissions"
- Verifica que el usuario tenga el rol correcto
- Verifica que la tabla `user_roles` existe
- Verifica que el usuario tiene un rol asignado

### No puedo acceder a `/dashboard/admin/roles`
- Solo los usuarios con rol 'admin' pueden acceder
- Asigna el rol 'admin' a tu usuario

### Los nuevos usuarios no tienen rol
- Verifica que la función `assignDefaultRole` se está llamando en el registro
- Verifica que la tabla `user_roles` existe y tiene las políticas correctas

