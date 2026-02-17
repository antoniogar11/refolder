# FAQ de Errores y Solucion de Problemas - Refolder

## Tabla de Contenidos

- [Errores de Login en Vercel](#errores-de-login-en-vercel)
- [Vercel usa un commit viejo](#vercel-usa-un-commit-viejo)
- [Errores encontrados en la aplicacion](#errores-encontrados-en-la-aplicacion)

---

## Errores de Login en Vercel

### 1. Variables de Entorno No Configuradas

**Sintoma**: Error de conexion o "Missing environment variables"

**Solucion**:
1. Ve a tu proyecto en Vercel
2. Settings > **Environment Variables**
3. Asegurate de tener estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (con tu URL de Vercel)

4. **IMPORTANTE**: Despues de anadir variables, haz un **Redeploy**

### 2. URLs de Supabase No Configuradas

**Sintoma**: Error de redireccion o callback falla

**Solucion**:
1. Ve a tu proyecto en Supabase
2. Settings > **Authentication** > **URL Configuration**
3. En **"Site URL"**, pon: `https://tu-app.vercel.app`
4. En **"Redirect URLs"**, agrega:
   ```
   https://tu-app.vercel.app/**
   https://tu-app.vercel.app/auth/callback
   ```
5. Guarda los cambios

### 3. `NEXT_PUBLIC_APP_URL` Incorrecta

**Sintoma**: Los callbacks no funcionan

**Solucion**:
1. En Vercel, Settings > **Environment Variables**
2. Edita `NEXT_PUBLIC_APP_URL`
3. Debe ser exactamente: `https://tu-app.vercel.app`
   (Sin barra al final, con https://)
4. Haz un **Redeploy**

### 4. Error "Invalid redirect URL"

**Sintoma**: Supabase rechaza la redireccion

**Solucion**:
- Verifica que en Supabase > Settings > Authentication > URL Configuration
- Tienes agregado: `https://tu-app.vercel.app/**` en Redirect URLs
- Y `https://tu-app.vercel.app` en Site URL

### 5. Error de CORS o Conexion

**Sintoma**: No se puede conectar a Supabase

**Solucion**:
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` es correcta
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcta
- Asegurate de que esten marcadas para **Production** en Vercel

### Verificar Configuracion

#### Variables de Entorno en Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://refolder-xxxxx.vercel.app
```

#### URLs en Supabase:

**Site URL**: `https://refolder-xxxxx.vercel.app`

**Redirect URLs**:
```
https://refolder-xxxxx.vercel.app/**
https://refolder-xxxxx.vercel.app/auth/callback
http://localhost:3000/** (para desarrollo local)
```

### Pasos generales para solucionar errores de login

1. **Verifica variables de entorno en Vercel**
   - Settings > Environment Variables
   - Todas las variables deben estar configuradas
   - `NEXT_PUBLIC_APP_URL` debe tener la URL de Vercel

2. **Configura Supabase**
   - Agrega la URL de Vercel a Redirect URLs
   - Cambia Site URL a la URL de Vercel

3. **Redeploy en Vercel**
   - Despues de cambiar variables, haz Redeploy
   - Esto aplica los cambios

4. **Prueba de nuevo**
   - Limpia la cache del navegador
   - Prueba iniciar sesion de nuevo

---

## Vercel usa un commit viejo

### Problema
Vercel esta haciendo build de un commit viejo en lugar del mas reciente con correcciones.

### Opcion 1: Forzar Redeploy del ultimo commit (Recomendado)

1. Ve a tu proyecto en Vercel
2. Ve a la pestana **"Deployments"**
3. Busca el deployment que esta fallando
4. Haz click en los **3 puntos** del deployment
5. Click en **"Redeploy"**
6. Selecciona **"Use existing Build Cache"** si aparece
7. Click en **"Redeploy"**

Esto deberia tomar el ultimo commit de GitHub.

### Opcion 2: Verificar que Vercel esta conectado a la rama correcta

1. Ve a tu proyecto en Vercel
2. Settings > **Git**
3. Verifica que:
   - **Production Branch**: `main`
   - **Repository**: `antoniogar11/refolder`

### Opcion 3: Hacer un nuevo deploy manual

1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en **"Create Deployment"**
4. Branch: `main`
5. Click en **"Deploy"**

### Verificar

Despues del redeploy, verifica en los logs que use el commit correcto:

```
Cloning github.com/antoniogar11/refolder (Branch: main, Commit: xxxxxxx)
```

---

## Errores encontrados en la aplicacion

### CRITICOS (Rompen la funcionalidad)

#### 1. Archivo `app/dashboard/empresa/actions.ts` vacio
- **Problema**: Este archivo contiene funciones criticas que son usadas por los componentes:
  - `addCompanyMemberAction` - Usado por `AddMemberForm`
  - `updateWorkerPermissionsAction` - Usado por `WorkerPermissionsForm`
  - `deleteCompanyMemberAction` - Usado para eliminar miembros
- **Impacto**: La seccion de "Mi Empresa" no funciona
- **Solucion**: Restaurar el archivo completo

#### 2. Archivo `components/company/company-members-list.tsx` vacio
- **Problema**: Este componente muestra la lista de miembros de la empresa
- **Impacto**: No se pueden ver los miembros de la empresa
- **Solucion**: Restaurar el componente

### IMPORTANTES (Funcionalidad incompleta)

#### 3. Dashboard principal sin validacion de permisos
- **Problema**: `app/dashboard/page.tsx` muestra todos los cards sin verificar permisos de trabajadores
- **Impacto**: Los trabajadores ven todos los apartados aunque no tengan permisos
- **Solucion**: Implementar validacion de permisos como estaba antes

#### 4. Paginas individuales sin validacion de permisos
- **Problema**: Las paginas de obras, clientes, finanzas, presupuestos y control horario no validan permisos
- **Impacto**: Los trabajadores pueden acceder a secciones sin permisos
- **Solucion**: Agregar validaciones de permisos en cada pagina

#### 5. Funciones de permisos faltantes
- **Problema**: `getCurrentMember()` y `hasWorkerPermission()` fueron eliminadas pero se necesitan
- **Impacto**: No se pueden verificar permisos de trabajadores
- **Solucion**: Restaurar estas funciones en `lib/data/companies.ts` (YA HECHO)

### CORREGIDOS

#### 6. Funciones de permisos restauradas
- `getCurrentMember()` - Restaurada
- `hasWorkerPermission()` - Restaurada

### Proximos pasos para corregir errores

1. Restaurar `app/dashboard/empresa/actions.ts`
2. Restaurar `components/company/company-members-list.tsx`
3. Implementar validacion de permisos en dashboard principal
4. Implementar validacion de permisos en paginas individuales
