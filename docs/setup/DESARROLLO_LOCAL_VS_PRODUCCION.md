# Desarrollo Local vs Produccion (Vercel)

## Si, puedes seguir viendo la app en local

**La mejor forma de desarrollar es usar tu entorno local** porque:
- Cambios instantaneos (Hot Reload)
- No esperas builds en Vercel
- Puedes ver errores en tiempo real
- Mas rapido para desarrollar

## Flujo de Trabajo Recomendado

```
1. DESARROLLO LOCAL (rapido, instantaneo)
   |
   npm run dev
   |
   Ve a: http://localhost:3000
   |
   Haces cambios -> Se ven inmediatamente
   |
   Pruebas todo localmente
   |
2. CUANDO ESTES SATISFECHO:
   |
   git add .
   git commit -m "descripcion"
   git push origin main
   |
3. VERCEL (produccion, automatico)
   |
   Vercel detecta el cambio
   |
   Hace build y deploy (2-3 minutos)
   |
   Tu app online se actualiza
```

## Como Usar el Servidor Local

### Iniciar el servidor de desarrollo:

```bash
cd /Users/macdeantonio/Refolder/refolder
npm run dev
```

### Ver la app:

Abre tu navegador y ve a:
```
http://localhost:3000
```

### Caracteristicas del desarrollo local:

- **Hot Reload**: Los cambios se ven instantaneamente
- **Fast Refresh**: React actualiza sin perder el estado
- **Error Overlay**: Los errores se muestran en el navegador
- **Logs en consola**: Veras todos los logs y errores

## Comparacion: Local vs Vercel

| Caracteristica | Local (`npm run dev`) | Vercel (Produccion) |
|----------------|----------------------|---------------------|
| **Velocidad** | Instantaneo | 2-3 minutos (build) |
| **Cambios** | Hot Reload | Deploy completo |
| **Base de datos** | Misma (Supabase) | Misma (Supabase) |
| **URL** | `localhost:3000` | `tu-app.vercel.app` |
| **Variables env** | `.env.local` | Vercel Settings |
| **Para desarrollo** | Ideal | No recomendado |
| **Para produccion** | No recomendado | Ideal |

## Configuracion del Entorno Local

### Variables de entorno:

Tu archivo `.env.local` ya esta configurado con:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `GEMINI_API_KEY`

No necesitas cambiar nada, ya funciona.

### Cuando trabajes localmente:

- Usa: `http://localhost:3000`
- Los cambios se ven al instante
- No necesitas hacer push a cada cambio
- Solo haz push cuando estes satisfecho

## Buenas Practicas

### Para desarrollo diario:

1. **Trabaja en local**:
   ```bash
   npm run dev
   ```

2. **Haz cambios y prueba** en `localhost:3000`

3. **Cuando funcione bien**, haz commit y push:
   ```bash
   git add .
   git commit -m "descripcion"
   git push origin main
   ```

4. **Vercel actualiza automaticamente** en produccion

### Para ver cambios en movil desde local:

Si quieres probar en tu movil mientras desarrollas:

1. Inicia el servidor en modo red:
   ```bash
   npm run dev:network
   ```

2. Encontraras tu IP local en el terminal

3. Abre en tu movil: `http://TU_IP:3000`

## Diferencias Importantes

### Variables de entorno:

- **Local**: Usa `.env.local`
- **Vercel**: Usa Environment Variables en Vercel Settings

Si cambias variables en `.env.local`, **solo afecta a local**, no a Vercel.

### Base de datos:

- **Local y Vercel**: Usan la misma base de datos (Supabase)
- Los datos son compartidos
- Cambios en local se ven en produccion y viceversa

## Resumen

**Para desarrollar**: Usa `npm run dev` en local
- Cambios instantaneos
- Desarrollo rapido

**Para produccion**: Push a GitHub
- Vercel hace deploy automatico
- App accesible desde Internet

**Lo mejor**: Desarrolla local, despliega a Vercel cuando este listo.
