# ✅ Checklist para Deploy en Vercel

## Estado Actual
- ✅ Repositorio en GitHub: `https://github.com/antoniogar11/refolder.git`
- ✅ Archivos de configuración creados (`vercel.json`)
- ✅ `.gitignore` configurado correctamente
- ⚠️ Hay cambios sin commitear que deben subirse primero

## Pasos ANTES de hacer deploy en Vercel:

### 1. Hacer Commit y Push de todos los cambios

```bash
cd /Users/macdeantonio/Refolder/refolder

# Ver qué cambios hay
git status

# Añadir todos los cambios
git add .

# Hacer commit
git commit -m "feat: mejoras de diseño profesional y PWA móvil"

# Subir a GitHub
git push origin main
```

### 2. Verificar que NO se sube `.env.local`

**IMPORTANTE**: Verifica que `.env.local` esté en `.gitignore` y NO se suba a GitHub.
El `.gitignore` ya está configurado correctamente.

### 3. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y crea cuenta/inicia sesión
2. Click en **"Add New Project"**
3. Conecta tu repositorio: `antoniogar11/refolder`
4. Vercel detectará automáticamente que es Next.js

### 4. Configurar Variables de Entorno en Vercel

En la sección **"Environment Variables"** de Vercel, añade:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://refolder.vercel.app (o la URL que te dé Vercel)
GEMINI_API_KEY=tu_gemini_api_key (opcional)
```

**⚠️ CRÍTICO**: Obtén estas variables de tu archivo `.env.local` local, pero **NUNCA** las subas a GitHub.

### 5. Click en "Deploy" 🚀

Vercel empezará a construir tu app automáticamente.

### 6. Después del Deploy

Una vez que tengas la URL de Vercel (ej: `https://refolder.vercel.app`):

1. **Actualiza Supabase**:
   - Ve a Supabase → Settings → Authentication → URL Configuration
   - Añade a "Redirect URLs": `https://tu-app.vercel.app/**`
   - Añade a "Site URL": `https://tu-app.vercel.app`

2. **Actualiza `NEXT_PUBLIC_APP_URL` en Vercel**:
   - Ve a Settings → Environment Variables
   - Actualiza `NEXT_PUBLIC_APP_URL` con la URL real de Vercel
   - Click "Redeploy" para aplicar los cambios

## ✅ Verificación Final

- [ ] Todos los cambios están en GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy completado exitosamente
- [ ] Supabase configurado con la URL de Vercel
- [ ] `NEXT_PUBLIC_APP_URL` actualizado con la URL real
- [ ] App funciona correctamente online

## 🆘 Problemas Comunes

### "Build failed"
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Vercel para ver el error específico

### "Authentication error"
- Asegúrate de que las URLs de Supabase incluyan tu dominio de Vercel
- Verifica que las keys de Supabase sean correctas

### "Service Worker no funciona"
- Verifica que `NEXT_PUBLIC_APP_URL` esté correcto
- Los service workers solo funcionan en HTTPS (Vercel lo proporciona automáticamente)

## 📱 Probar la App Móvil Online

Una vez desplegada, puedes:
1. Abrir la URL de Vercel en tu móvil
2. Añadirla a la pantalla de inicio (instalar como PWA)
3. Probar que funciona como app nativa


