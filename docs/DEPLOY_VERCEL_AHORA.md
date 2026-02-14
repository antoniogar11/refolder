# 🚀 ¡Perfecto! Ahora Deploy en Vercel

## ✅ Push completado

Tus cambios ya están en GitHub. Ahora vamos a desplegar la app en Vercel.

## 📋 Pasos para Deploy en Vercel

### 1. Ve a Vercel
Abre tu navegador y ve a: **https://vercel.com**

### 2. Crea cuenta / Inicia sesión
- Si no tienes cuenta, crea una (100% gratis)
- Puedes usar tu cuenta de GitHub para iniciar sesión

### 3. Conecta tu Repositorio
1. Click en **"Add New Project"** o **"New Project"**
2. Conecta tu cuenta de GitHub si no lo has hecho
3. Busca y selecciona tu repositorio: **`antoniogar11/refolder`**
4. Click en **"Import"**

### 4. Configuración del Proyecto
Vercel detectará automáticamente que es Next.js. NO cambies nada, solo continúa.

### 5. **IMPORTANTE: Añade Variables de Entorno**

Antes de hacer deploy, en la sección **"Environment Variables"**, añade estas variables:

#### Variables necesarias:

```
NEXT_PUBLIC_SUPABASE_URL
```
Valor: Tu URL de Supabase (la encuentras en Supabase → Settings → API)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Valor: Tu Anon Key de Supabase (en el mismo lugar)

```
SUPABASE_SERVICE_ROLE_KEY
```
Valor: Tu Service Role Key (en Supabase → Settings → API, debajo de Anon key)

```
NEXT_PUBLIC_APP_URL
```
Valor: Por ahora pon `https://localhost:3000` (lo actualizarás después con la URL que te dé Vercel)

```
GEMINI_API_KEY
```
Valor: Tu API key de Gemini (opcional, solo si usas el asistente de IA)

### 6. Deploy
Click en **"Deploy"**

Vercel empezará a construir tu app. Espera 2-3 minutos.

### 7. Obtener tu URL de Vercel

Una vez completado el deploy:
- Te dará una URL tipo: `https://refolder-xxxxx.vercel.app`
- **Copia esa URL**

### 8. Actualizar `NEXT_PUBLIC_APP_URL`

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita `NEXT_PUBLIC_APP_URL`
4. Cámbialo a la URL que te dio Vercel (ej: `https://refolder-xxxxx.vercel.app`)
5. Click en "Save"
6. Ve a "Deployments" y haz click en los 3 puntos del último deployment
7. Click en "Redeploy"

### 9. Configurar Supabase

1. Ve a tu proyecto en Supabase
2. Settings → Authentication → URL Configuration
3. En **"Redirect URLs"**, añade:
   ```
   https://tu-app.vercel.app/**
   ```
   (Reemplaza `tu-app.vercel.app` con tu URL real de Vercel)
4. En **"Site URL"**, cambia a:
   ```
   https://tu-app.vercel.app
   ```
5. Guarda los cambios

### 10. ¡Prueba tu App!

Abre tu URL de Vercel en el navegador. Tu app debería funcionar perfectamente.

## ✅ Checklist Final

- [ ] Repositorio conectado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] `NEXT_PUBLIC_APP_URL` actualizado con la URL de Vercel
- [ ] Supabase configurado con la URL de Vercel
- [ ] App funciona correctamente online

## 🎉 ¡Listo!

Tu app ahora está online y accesible desde cualquier dispositivo.

**URL de tu app:** `https://tu-app.vercel.app`

## 📱 Probar en Móvil

1. Abre la URL de Vercel en tu móvil
2. Añádela a la pantalla de inicio (instalar como PWA)
3. Prueba que funciona como app nativa


