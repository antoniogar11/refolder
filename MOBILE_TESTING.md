# Guía para Probar la App en Móvil

## Problemas Comunes y Soluciones

### 1. Viewport (✅ Ya corregido)
Se agregó el meta viewport al layout para que la página se vea correctamente en móviles.

### 2. Acceso desde Red Local

Para probar la app desde tu móvil en la misma red WiFi:

#### Paso 1: Obtener tu IP local
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### Paso 2: Actualizar .env.local
Edita `.env.local` y cambia:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Por tu IP local (ejemplo):
```env
NEXT_PUBLIC_APP_URL=http://192.168.0.21:3000
```

#### Paso 3: Iniciar el servidor en modo red
```bash
npm run dev:network
```

#### Paso 4: Acceder desde el móvil
Abre el navegador en tu móvil y ve a:
```
http://192.168.0.21:3000
```

### 3. Configurar Supabase para Red Local

Si tienes problemas de autenticación, asegúrate de que en el dashboard de Supabase:

1. Ve a **Authentication** > **URL Configuration**
2. Agrega tu IP local a **Redirect URLs**:
   ```
   http://192.168.0.21:3000/**
   ```
3. También agrega a **Site URL** (opcional):
   ```
   http://192.168.0.21:3000
   ```

### 4. Firewall de macOS

Si no puedes acceder desde el móvil, verifica el firewall:

```bash
# Ver estado del firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Si está activo, permite Node.js temporalmente
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### 5. Volver a Localhost

Cuando termines de probar, vuelve a cambiar `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Y reinicia el servidor con:
```bash
npm run dev
```

## Errores Comunes

### "Cannot connect to server"
- Verifica que el móvil esté en la misma red WiFi
- Verifica que el servidor esté corriendo con `npm run dev:network`
- Verifica el firewall de macOS

### "Authentication failed" o problemas de login
- Verifica que hayas agregado la IP local a las URLs permitidas en Supabase
- Verifica que `NEXT_PUBLIC_APP_URL` en `.env.local` tenga la IP correcta
- Reinicia el servidor después de cambiar `.env.local`

### La página se ve mal o muy pequeña
- ✅ Ya está corregido con el meta viewport
- Si persiste, limpia la caché del navegador móvil

