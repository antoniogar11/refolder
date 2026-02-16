# Sistema de Empresas - Guia de Configuracion

## Descripcion

Se ha implementado un sistema completo de empresas con administradores y trabajadores. Cuando un usuario se registra, automaticamente se crea una empresa de la cual es dueno y administrador.

## Caracteristicas

### 1. **Registro Automatico de Empresa**
- Al registrarse, cada usuario crea automaticamente su propia empresa
- El usuario se convierte en dueno y administrador de la empresa

### 2. **Administradores**
- El dueno de la empresa puede anadir otros administradores
- Los administradores tienen acceso completo a la empresa
- Pueden gestionar trabajadores y sus permisos

### 3. **Trabajadores**
- Los administradores pueden crear trabajadores
- Cada trabajador tiene permisos personalizables
- Los permisos se pueden configurar individualmente

## Instalacion

### Paso 1: Crear las tablas

Ejecuta el siguiente script SQL en Supabase:

```sql
-- El script esta en: sql/create_companies_table.sql
```

O copia y pega el contenido del archivo `sql/create_companies_table.sql` en el SQL Editor de Supabase.

### Paso 2: (Opcional) Funcion para buscar usuarios

Para poder anadir miembros por email, necesitas crear una funcion RPC. Sin embargo, debido a las limitaciones de seguridad de Supabase, es mejor implementar la busqueda desde el cliente usando la API de admin.

**Alternativa recomendada:** Modificar `addCompanyMemberAction` para usar la API de admin de Supabase con SERVICE_ROLE_KEY.

## Archivos Creados

### Base de Datos
- `sql/create_companies_table.sql` - Script SQL para crear tablas de empresas y miembros
- `sql/create_find_user_by_email_function.sql` - Funcion helper (opcional)

### Librerias
- `lib/data/companies.ts` - Funciones para gestionar empresas y miembros

### Componentes
- `components/company/add-member-form.tsx` - Formulario para anadir miembros
- `components/company/company-members-list.tsx` - Lista de miembros
- `components/company/worker-permissions-form.tsx` - Gestion de permisos de trabajadores

### Paginas
- `app/dashboard/empresa/page.tsx` - Pagina principal de gestion de empresa

### Acciones
- `app/dashboard/empresa/actions.ts` - Server actions para gestionar miembros

## Estructura de Permisos

### Permisos Disponibles para Trabajadores

- **Proyectos:**
  - `projects:read` - Ver proyectos
  - `projects:write` - Crear/editar proyectos
  - `projects:delete` - Eliminar proyectos

- **Clientes:**
  - `clients:read` - Ver clientes
  - `clients:write` - Crear/editar clientes
  - `clients:delete` - Eliminar clientes

- **Finanzas:**
  - `finances:read` - Ver finanzas
  - `finances:write` - Crear/editar finanzas
  - `finances:delete` - Eliminar finanzas

- **Tareas:**
  - `tasks:read` - Ver tareas
  - `tasks:write` - Crear/editar tareas
  - `tasks:delete` - Eliminar tareas

## Uso

### Acceder a la Gestion de Empresa

1. Ve a `/dashboard`
2. Haz clic en "Gestionar Empresa"
3. O accede directamente a `/dashboard/empresa`

### Anadir un Administrador

1. En la pagina de empresa, haz clic en "+ Anadir Miembro"
2. Ingresa el email del usuario
3. Selecciona "Administrador"
4. Haz clic en "Anadir"

**Nota:** Actualmente, la busqueda por email requiere implementar la API de admin de Supabase. Ver seccion de implementacion pendiente.

### Crear un Trabajador

1. En la pagina de empresa, haz clic en "+ Anadir Miembro"
2. Ingresa el email del usuario
3. Selecciona "Trabajador"
4. Haz clic en "Anadir"
5. Una vez creado, haz clic en "Gestionar Permisos" para configurar que puede hacer

### Configurar Permisos de Trabajador

1. En la lista de miembros, encuentra el trabajador
2. Haz clic en "Gestionar Permisos"
3. Marca los permisos que quieres otorgar
4. Haz clic en "Guardar Permisos"

## Implementacion Pendiente

### Busqueda de Usuarios por Email

La funcion `addCompanyMemberAction` actualmente no puede buscar usuarios por email porque requiere acceso a `auth.users`, que no esta disponible directamente desde las funciones RPC por seguridad.

**Opciones de implementacion:**

1. **Usar API de Admin de Supabase (Recomendado):**
   - Crear un endpoint API route en Next.js
   - Usar SERVICE_ROLE_KEY para buscar usuarios
   - Llamar a este endpoint desde el cliente

2. **Crear tabla de usuarios publicos:**
   - Crear un trigger que sincronice `auth.users` con una tabla publica
   - Buscar en esta tabla desde las funciones RPC

3. **Usar invitaciones por email:**
   - Enviar un email de invitacion
   - El usuario acepta y se anade automaticamente

## Politicas RLS

Las politicas RLS estan configuradas para:
- Los duenos pueden gestionar completamente su empresa
- Los administradores pueden gestionar miembros y trabajadores
- Los trabajadores solo pueden ver su propia informacion
- Los miembros solo pueden ver otros miembros de su empresa

## Solucion de Problemas

### Error: "No tienes una empresa"
- Verifica que el registro haya creado la empresa correctamente
- Revisa los logs del servidor
- Verifica que la tabla `companies` existe

### No puedo anadir miembros
- Verifica que eres administrador de la empresa
- Verifica que la tabla `company_members` existe
- Implementa la funcion de busqueda de usuarios (ver seccion de implementacion pendiente)

### Los permisos no se guardan
- Verifica que el campo `permissions` en `company_members` es de tipo JSONB
- Revisa los logs del servidor para errores
