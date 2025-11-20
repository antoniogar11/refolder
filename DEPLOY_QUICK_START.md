# ⚡ Inicio Rápido - Deploy en 5 Minutos

## Opción 1: Vercel (Recomendado) 🚀

### Pasos Rápidos:

1. **Prepara GitHub** (si no lo tienes):
   ```bash
   cd /Users/macdeantonio/Refolder/refolder
   git init
   git add .
   git commit -m "Ready for deploy"
   # Crea repo en GitHub y conecta
   ```

2. **Ve a [vercel.com](https://vercel.com)**:
   - Crea cuenta gratis
   - Click "Add New Project"
   - Conecta tu repositorio de GitHub

3. **Añade Variables de Entorno** en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` (de Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (de Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` (de Supabase)
   - `NEXT_PUBLIC_APP_URL` (lo actualizas después con tu URL de Vercel)
   - `GEMINI_API_KEY` (opcional)

4. **Click "Deploy"** 🎉

5. **Actualiza Supabase**:
   - Ve a Supabase → Settings → Authentication
   - Añade tu URL de Vercel a Redirect URLs

6. **Actualiza `NEXT_PUBLIC_APP_URL`** en Vercel:
   - Vuelve a Vercel → Settings → Environment Variables
   - Actualiza `NEXT_PUBLIC_APP_URL` con: `https://tu-app.vercel.app`
   - Redeploy

## Opción 2: Netlify (Alternativa) 🌐

1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Conecta GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Añade las mismas variables de entorno
6. Deploy

## ✅ Resultado

Tendrás tu app online en:
- **Vercel**: `tu-app.vercel.app`
- **Netlify**: `tu-app.netlify.app`

Ambas opciones son **100% gratuitas** y te dan HTTPS automático.

## 🔒 Seguridad

- ✅ Nunca subas `.env.local` a GitHub
- ✅ Usa variables de entorno en la plataforma
- ✅ Las keys quedan seguras en la plataforma

