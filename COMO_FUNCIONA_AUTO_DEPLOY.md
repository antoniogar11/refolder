# 🔄 Cómo Funciona el Auto-Deploy en Vercel

## ✅ Sí, los cambios se reflejan automáticamente

Si tu proyecto de Vercel está conectado a GitHub, **cada vez que hagas push a la rama `main`**, Vercel hará automáticamente un nuevo deploy.

## 🔄 Flujo de Trabajo

```
1. Tú haces cambios en tu código local
   ↓
2. Haces commit: git commit -m "mensaje"
   ↓
3. Haces push: git push origin main
   ↓
4. GitHub recibe los cambios
   ↓
5. Vercel detecta el cambio en GitHub (automático)
   ↓
6. Vercel hace build y deploy automáticamente
   ↓
7. Tu app online se actualiza con los cambios
```

## 📋 Cómo Verificar que Está Configurado

### En Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Git**
3. Verifica que:
   - ✅ **Connected Git Repository**: `antoniogar11/refolder`
   - ✅ **Production Branch**: `main`
   - ✅ **Automatic deployments from Git** está habilitado

Si está así configurado, **cada push a `main`** disparará un nuevo deployment automáticamente.

## 🎯 Cómo Hacer Cambios y Actualizar la App

### Opción 1: Yo hago los cambios y push (automático)

Cuando yo haga cambios y los suba a GitHub:
```bash
git add .
git commit -m "descripción"
git push origin main
```

Vercel detectará automáticamente el cambio y hará un nuevo deploy.

### Opción 2: Tú haces cambios manualmente

1. Editas los archivos en tu ordenador
2. Ejecutas estos comandos:
   ```bash
   cd /Users/macdeantonio/Refolder/refolder
   git add .
   git commit -m "descripción de cambios"
   git push origin main
   ```
3. Vercel detectará el cambio automáticamente
4. Espera 2-3 minutos mientras Vercel hace build
5. Tu app online se actualiza

## ⏱️ Tiempo de Espera

- **Build en Vercel**: 2-3 minutos normalmente
- **Deploy**: Automático después del build
- **Total**: ~3-5 minutos desde que haces push hasta que está online

## 🔍 Cómo Ver si el Deploy Está en Progreso

1. Ve a tu proyecto en Vercel
2. Ve a la pestaña **"Deployments"**
3. Verás una lista de todos los deployments
4. El más reciente mostrará el estado:
   - ⏳ **Building** (en progreso)
   - ✅ **Ready** (completado)
   - ❌ **Error** (falló)

## 💡 Consejo

Si quieres probar cambios sin afectar la versión en producción, puedes:
- Crear una rama nueva
- Hacer cambios en esa rama
- Hacer push a esa rama
- Vercel creará un **Preview Deployment** con una URL temporal
- Puedes probar ahí antes de hacer merge a `main`

## ⚠️ Importante

Los cambios **solo se reflejan automáticamente** si:
1. ✅ Vercel está conectado a GitHub
2. ✅ Haces push a la rama `main` (o la rama configurada como producción)
3. ✅ El build es exitoso

Si el build falla, los cambios **NO** se desplegarán, pero Vercel te notificará del error.

## 🔔 Notificaciones

Puedes configurar notificaciones en Vercel para que te avise cuando:
- Un deploy se completa
- Un deploy falla
- Hay un nuevo deployment

Ve a **Settings** → **Notifications** en Vercel para configurarlo.


