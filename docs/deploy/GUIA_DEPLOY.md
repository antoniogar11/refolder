# Guia de Deploy - Refolder

## Tabla de Contenidos

- [Quick Start](#quick-start)
- [Checklist Pre-Deploy](#checklist-pre-deploy)
- [Guia Completa Vercel](#guia-completa-vercel)
- [Deploy Paso a Paso](#deploy-paso-a-paso)
- [Auto-Deploy](#auto-deploy)
- [Otras Opciones de Deploy](#otras-opciones-de-deploy)
- [Problemas Comunes](#problemas-comunes)

---

## Quick Start

### Opcion 1: Vercel (Recomendado)

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

3. **Agrega Variables de Entorno** en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` (de Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (de Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` (de Supabase)
   - `NEXT_PUBLIC_APP_URL` (lo actualizas despues con tu URL de Vercel)
   - `GEMINI_API_KEY` (opcional)

4. **Click "Deploy"**

5. **Actualiza Supabase**:
   - Ve a Supabase > Settings > Authentication
   - Agrega tu URL de Vercel a Redirect URLs

6. **Actualiza `NEXT_PUBLIC_APP_URL`** en Vercel:
   - Vuelve a Vercel > Settings > Environment Variables
   - Actualiza `NEXT_PUBLIC_APP_URL` con: `https://tu-app.vercel.app`
   - Redeploy

### Opcion 2: Netlify (Alternativa)

1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" > "Import an existing project"
3. Conecta GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Agrega las mismas variables de entorno
6. Deploy

### Resultado

Tendras tu app online en:
- **Vercel**: `tu-app.vercel.app`
- **Netlify**: `tu-app.netlify.app`

Ambas opciones son **100% gratuitas** y te dan HTTPS automatico.

### Seguridad

- Nunca subas `.env.local` a GitHub
- Usa variables de entorno en la plataforma
- Las keys quedan seguras en la plataforma

---

## Checklist Pre-Deploy

### Estado Actual
- Repositorio en GitHub: `https://github.com/antoniogar11/refolder.git`
- Archivos de configuracion creados (`vercel.json`)
- `.gitignore` configurado correctamente

### Pasos ANTES de hacer deploy en Vercel

#### 1. Hacer Commit y Push de todos los cambios

```bash
cd /Users/macdeantonio/Refolder/refolder

# Ver que cambios hay
git status

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "feat: mejoras de diseno profesional y PWA movil"

# Subir a GitHub
git push origin main
```

#### 2. Verificar que NO se sube `.env.local`

**IMPORTANTE**: Verifica que `.env.local` este en `.gitignore` y NO se suba a GitHub.
El `.gitignore` ya esta configurado correctamente.

#### 3. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y crea cuenta/inicia sesion
2. Click en **"Add New Project"**
3. Conecta tu repositorio: `antoniogar11/refolder`
4. Vercel detectara automaticamente que es Next.js

#### 4. Configurar Variables de Entorno en Vercel

En la seccion **"Environment Variables"** de Vercel, agrega:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://refolder.vercel.app (o la URL que te de Vercel)
GEMINI_API_KEY=tu_gemini_api_key (opcional)
```

**CRITICO**: Obten estas variables de tu archivo `.env.local` local, pero **NUNCA** las subas a GitHub.

#### 5. Click en "Deploy"

Vercel empezara a construir tu app automaticamente.

#### 6. Despues del Deploy

Una vez que tengas la URL de Vercel (ej: `https://refolder.vercel.app`):

1. **Actualiza Supabase**:
   - Ve a Supabase > Settings > Authentication > URL Configuration
   - Agrega a "Redirect URLs": `https://tu-app.vercel.app/**`
   - Agrega a "Site URL": `https://tu-app.vercel.app`

2. **Actualiza `NEXT_PUBLIC_APP_URL` en Vercel**:
   - Ve a Settings > Environment Variables
   - Actualiza `NEXT_PUBLIC_APP_URL` con la URL real de Vercel
   - Click "Redeploy" para aplicar los cambios

### Verificacion Final

- [ ] Todos los cambios estan en GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy completado exitosamente
- [ ] Supabase configurado con la URL de Vercel
- [ ] `NEXT_PUBLIC_APP_URL` actualizado con la URL real
- [ ] App funciona correctamente online

---

## Guia Completa Vercel

### Por que Vercel?

- **100% Gratis** para proyectos personales
- **Optimizado para Next.js** (hecho por el mismo equipo)
- **Deploy automatico** desde GitHub
- **HTTPS incluido** (certificado SSL automatico)
- **Dominio gratuito** (tipo: `tu-app.vercel.app`)
- **Sin limites** de bandwidth para proyectos personales

### 1. Preparar el Repositorio en GitHub

```bash
# Asegurate de estar en el directorio del proyecto
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
4. En la seccion "Environment Variables", agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
GEMINI_API_KEY=tu_gemini_api_key (opcional)
```

**IMPORTANTE:**
- No subas tu `.env.local` a GitHub (debe estar en `.gitignore`)
- Agrega las variables en Vercel antes de hacer el deploy
- Actualiza `NEXT_PUBLIC_APP_URL` despues del primer deploy con la URL que te de Vercel

### 3. Deploy Automatico

Una vez configurado:
- Vercel detectara cambios en tu repositorio
- Cada `git push` hara un deploy automatico
- Cada Pull Request creara un preview URL para probar

### 4. Configuracion Adicional

#### Actualizar URLs en Supabase

1. Ve a tu proyecto de Supabase
2. Settings > Authentication > URL Configuration
3. Agrega tu URL de Vercel a "Redirect URLs":
   ```
   https://tu-app.vercel.app/**
   ```
4. Agrega tambien a "Site URL":
   ```
   https://tu-app.vercel.app
   ```

#### Actualizar Service Worker para PWA

El service worker necesita actualizar la URL base. Se actualiza automaticamente con `NEXT_PUBLIC_APP_URL`.

---

## Deploy Paso a Paso

### 1. Ve a Vercel
Abre tu navegador y ve a: **https://vercel.com**

### 2. Crea cuenta / Inicia sesion
- Si no tienes cuenta, crea una (100% gratis)
- Puedes usar tu cuenta de GitHub para iniciar sesion

### 3. Conecta tu Repositorio
1. Click en **"Add New Project"** o **"New Project"**
2. Conecta tu cuenta de GitHub si no lo has hecho
3. Busca y selecciona tu repositorio: **`antoniogar11/refolder`**
4. Click en **"Import"**

### 4. Configuracion del Proyecto
Vercel detectara automaticamente que es Next.js. NO cambies nada, solo continua.

### 5. Agrega Variables de Entorno

Antes de hacer deploy, en la seccion **"Environment Variables"**, agrega estas variables:

#### Variables necesarias:

| Variable | Donde encontrarla |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (debajo de Anon key) |
| `NEXT_PUBLIC_APP_URL` | Por ahora pon `https://localhost:3000` (lo actualizaras despues) |
| `GEMINI_API_KEY` | Opcional, solo si usas el asistente de IA |

### 6. Deploy
Click en **"Deploy"**. Vercel empezara a construir tu app. Espera 2-3 minutos.

### 7. Obtener tu URL de Vercel
Una vez completado el deploy:
- Te dara una URL tipo: `https://refolder-xxxxx.vercel.app`
- **Copia esa URL**

### 8. Actualizar `NEXT_PUBLIC_APP_URL`
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Edita `NEXT_PUBLIC_APP_URL`
4. Cambialo a la URL que te dio Vercel (ej: `https://refolder-xxxxx.vercel.app`)
5. Click en "Save"
6. Ve a "Deployments" y haz click en los 3 puntos del ultimo deployment
7. Click en "Redeploy"

### 9. Configurar Supabase
1. Ve a tu proyecto en Supabase
2. Settings > Authentication > URL Configuration
3. En **"Redirect URLs"**, agrega:
   ```
   https://tu-app.vercel.app/**
   ```
   (Reemplaza `tu-app.vercel.app` con tu URL real de Vercel)
4. En **"Site URL"**, cambia a:
   ```
   https://tu-app.vercel.app
   ```
5. Guarda los cambios

### 10. Prueba tu App
Abre tu URL de Vercel en el navegador. Tu app deberia funcionar perfectamente.

### Probar en Movil
1. Abre la URL de Vercel en tu movil
2. Agregala a la pantalla de inicio (instalar como PWA)
3. Prueba que funciona como app nativa

---

## Auto-Deploy

### Como funciona

Si tu proyecto de Vercel esta conectado a GitHub, **cada vez que hagas push a la rama `main`**, Vercel hara automaticamente un nuevo deploy.

### Flujo de Trabajo

```
1. Tu haces cambios en tu codigo local
   |
2. Haces commit: git commit -m "mensaje"
   |
3. Haces push: git push origin main
   |
4. GitHub recibe los cambios
   |
5. Vercel detecta el cambio en GitHub (automatico)
   |
6. Vercel hace build y deploy automaticamente
   |
7. Tu app online se actualiza con los cambios
```

### Verificar que esta configurado

En Vercel:
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Git**
3. Verifica que:
   - **Connected Git Repository**: `antoniogar11/refolder`
   - **Production Branch**: `main`
   - **Automatic deployments from Git** esta habilitado

### Como hacer cambios y actualizar la app

#### Opcion 1: Desde la terminal

```bash
git add .
git commit -m "descripcion"
git push origin main
```

Vercel detectara automaticamente el cambio y hara un nuevo deploy.

#### Opcion 2: Cambios manuales

1. Editas los archivos en tu ordenador
2. Ejecutas estos comandos:
   ```bash
   cd /Users/macdeantonio/Refolder/refolder
   git add .
   git commit -m "descripcion de cambios"
   git push origin main
   ```
3. Vercel detectara el cambio automaticamente
4. Espera 2-3 minutos mientras Vercel hace build
5. Tu app online se actualiza

### Tiempo de Espera

- **Build en Vercel**: 2-3 minutos normalmente
- **Deploy**: Automatico despues del build
- **Total**: ~3-5 minutos desde que haces push hasta que esta online

### Ver si el Deploy esta en progreso

1. Ve a tu proyecto en Vercel
2. Ve a la pestana **"Deployments"**
3. Veras una lista de todos los deployments
4. El mas reciente mostrara el estado:
   - **Building** (en progreso)
   - **Ready** (completado)
   - **Error** (fallo)

### Consejo: Preview Deployments

Si quieres probar cambios sin afectar la version en produccion, puedes:
- Crear una rama nueva
- Hacer cambios en esa rama
- Hacer push a esa rama
- Vercel creara un **Preview Deployment** con una URL temporal
- Puedes probar ahi antes de hacer merge a `main`

### Importante

Los cambios **solo se reflejan automaticamente** si:
1. Vercel esta conectado a GitHub
2. Haces push a la rama `main` (o la rama configurada como produccion)
3. El build es exitoso

Si el build falla, los cambios **NO** se desplegaran, pero Vercel te notificara del error.

### Notificaciones

Puedes configurar notificaciones en Vercel para que te avise cuando:
- Un deploy se completa
- Un deploy falla
- Hay un nuevo deployment

Ve a **Settings** > **Notifications** en Vercel para configurarlo.

---

## Otras Opciones de Deploy

### Netlify
- Tambien gratis
- Similar a Vercel
- [netlify.com](https://netlify.com)

### Render
- Tier gratis limitado
- [render.com](https://render.com)

### Railway
- $5 credito gratis al mes
- [railway.app](https://railway.app)

**Recomendacion:** Usa Vercel. Es la mejor opcion para Next.js, completamente gratis y sin limitaciones molestas para proyectos personales.

---

## Problemas Comunes

### "Build failed"
- Verifica que todas las variables de entorno esten configuradas
- Revisa los logs en Vercel para ver el error especifico

### "Authentication error"
- Asegurate de que las URLs de Supabase incluyan tu dominio de Vercel
- Verifica que las keys de Supabase sean correctas

### "Service Worker no funciona"
- Verifica que `NEXT_PUBLIC_APP_URL` este correcto
- Los service workers solo funcionan en HTTPS (Vercel lo proporciona automaticamente)

### La app no funciona online
- Verifica que las URLs de Supabase incluyan tu dominio de Vercel
- Asegurate de que `NEXT_PUBLIC_APP_URL` este correcto
