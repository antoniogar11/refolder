# 🔧 Solución: Error al Iniciar Sesión en Vercel

## ⚠️ Problemas Comunes

### 1. Variables de Entorno No Configuradas

**Síntoma**: Error de conexión o "Missing environment variables"

**Solución**:
1. Ve a tu proyecto en Vercel
2. Settings → **Environment Variables**
3. Asegúrate de tener estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (con tu URL de Vercel)

4. **IMPORTANTE**: Después de añadir variables, haz un **Redeploy**

### 2. URLs de Supabase No Configuradas

**Síntoma**: Error de redirección o callback falla

**Solución**:
1. Ve a tu proyecto en Supabase
2. Settings → **Authentication** → **URL Configuration**
3. En **"Site URL"**, pon: `https://tu-app.vercel.app`
4. En **"Redirect URLs"**, añade:
   ```
   https://tu-app.vercel.app/**
   https://tu-app.vercel.app/auth/callback
   ```
5. Guarda los cambios

### 3. `NEXT_PUBLIC_APP_URL` Incorrecta

**Síntoma**: Los callbacks no funcionan

**Solución**:
1. En Vercel, Settings → **Environment Variables**
2. Edita `NEXT_PUBLIC_APP_URL`
3. Debe ser exactamente: `https://tu-app.vercel.app`
   (Sin barra al final, con https://)
4. Haz un **Redeploy**

### 4. Error "Invalid redirect URL"

**Síntoma**: Supabase rechaza la redirección

**Solución**:
- Verifica que en Supabase → Settings → Authentication → URL Configuration
- Tienes añadido: `https://tu-app.vercel.app/**` en Redirect URLs
- Y `https://tu-app.vercel.app` en Site URL

### 5. Error de CORS o Conexión

**Síntoma**: No se puede conectar a Supabase

**Solución**:
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` es correcta
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcta
- Asegúrate de que estén marcadas para **Production** en Vercel

## 🔍 Verificar Configuración

### Variables de Entorno en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://refolder-xxxxx.vercel.app
```

### URLs en Supabase:

**Site URL**: `https://refolder-xxxxx.vercel.app`

**Redirect URLs**:
```
https://refolder-xxxxx.vercel.app/**
https://refolder-xxxxx.vercel.app/auth/callback
http://localhost:3000/** (para desarrollo local)
```

## 📝 Pasos para Solucionar

1. **Verifica variables de entorno en Vercel**
   - Settings → Environment Variables
   - Todas las variables deben estar configuradas
   - `NEXT_PUBLIC_APP_URL` debe tener la URL de Vercel

2. **Configura Supabase**
   - Añade la URL de Vercel a Redirect URLs
   - Cambia Site URL a la URL de Vercel

3. **Redeploy en Vercel**
   - Después de cambiar variables, haz Redeploy
   - Esto aplica los cambios

4. **Prueba de nuevo**
   - Limpia la caché del navegador
   - Prueba iniciar sesión de nuevo

## 🆘 Si Sigue Sin Funcionar

Dime exactamente qué error ves:
- ¿Qué mensaje aparece?
- ¿En qué página está el error?
- ¿Qué pasa cuando intentas iniciar sesión?

Con esa información puedo ayudarte mejor.


