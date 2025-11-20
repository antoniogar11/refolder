# Scripts de Setup de Base de Datos

## Ejecutar SQL automáticamente

Para ejecutar el SQL automáticamente, necesitas la **SERVICE_ROLE_KEY** de Supabase:

1. **Obtén la SERVICE_ROLE_KEY:**
   - Ve a: https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/settings/api
   - Copia la **"service_role" key** (la secreta, NO la anon key)

2. **Ejecuta el script:**
   ```bash
   SERVICE_ROLE_KEY=tu_key_aqui npm run setup-db
   ```

**Nota:** Supabase no permite ejecutar SQL arbitrario por la API REST por seguridad. Si el script no funciona, deberás ejecutar el SQL manualmente en el SQL Editor de Supabase.

## Ejecutar SQL manualmente (Recomendado)

1. Abre el archivo: `sql/QUICK_SETUP.sql`
2. Copia todo el contenido
3. Ve a: https://supabase.com/dashboard/project/rnuosfoxruutkmfzwvzr/sql
4. Pega el contenido y haz clic en "Run"

