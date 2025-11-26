# 🚀 Guía para Desplegar Refolder en Vercel (GRATIS)

## ¿Por qué Vercel?
- ✅ **100% Gratis** para proyectos personales
- ✅ **Optimizado para Next.js** (hecho por el mismo equipo)
- ✅ **Deploy automático** desde GitHub
- ✅ **HTTPS incluido** (certificado SSL automático)
- ✅ **Dominio gratuito** (tipo: `tu-app.vercel.app`)
- ✅ **Sin límites** de bandwidth para proyectos personales

## 📋 Pasos para Deployar

### 1. Preparar el Repositorio en GitHub

```bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/macdeantonio/Refolder/refolder

# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/refolder.git
git branch -M main
git push -u origin main
```

### 2. Configurar Variables de Entorno en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta (gratis)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. En la sección "Environment Variables", añade estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
GEMINI_API_KEY=tu_gemini_api_key (opcional)
```

**⚠️ IMPORTANTE:**
- No subas tu `.env.local` a GitHub (debe estar en `.gitignore`)
- Añade las variables en Vercel antes de hacer el deploy
- Actualiza `NEXT_PUBLIC_APP_URL` después del primer deploy con la URL que te dé Vercel

### 3. Deploy Automático

Una vez configurado:
- Vercel detectará cambios en tu repositorio
- Cada `git push` hará un deploy automático
- Cada Pull Request creará un preview URL para probar

## 🔧 Configuración Adicional

### Actualizar URLs en Supabase

1. Ve a tu proyecto de Supabase
2. Settings → Authentication → URL Configuration
3. Añade tu URL de Vercel a "Redirect URLs":
   ```
   https://tu-app.vercel.app/**
   ```
4. Añade también a "Site URL":
   ```
   https://tu-app.vercel.app
   ```

### Actualizar Service Worker para PWA

El service worker necesita actualizar la URL base. Se actualiza automáticamente con `NEXT_PUBLIC_APP_URL`.

## 📱 Otras Opciones Gratuitas

### Netlify (Alternativa)
- También gratis
- Similar a Vercel
- [netlify.com](https://netlify.com)

### Render (Alternativa)
- Tier gratis limitado
- [render.com](https://render.com)

### Railway (Alternativa)
- $5 crédito gratis al mes
- [railway.app](https://railway.app)

## 🎯 Recomendación

**Usa Vercel** - Es la mejor opción para Next.js, completamente gratis y sin limitaciones molestas para proyectos personales.

## ❓ Problemas Comunes

### El deploy falla
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Vercel Dashboard

### La app no funciona online
- Verifica que las URLs de Supabase incluyan tu dominio de Vercel
- Asegúrate de que `NEXT_PUBLIC_APP_URL` esté correcto

### Problemas con Service Worker
- Los service workers funcionan solo en HTTPS (que Vercel proporciona automáticamente)


