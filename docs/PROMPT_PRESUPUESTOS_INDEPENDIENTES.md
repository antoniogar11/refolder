# Prompt para Claude Code — Presupuestos independientes de obras

Copia y pega esto en Claude Code desde la raíz del proyecto `/refolder`:

---

## CONTEXTO

Refolder es una app Next.js 15 + Supabase + TailwindCSS para generar presupuestos de obras y reformas con IA. Actualmente los presupuestos solo se pueden crear desde dentro de una obra (en `/dashboard/obras/[id]`), lo cual obliga al usuario a crear una obra antes de poder presupuestar. Esto es una fricción innecesaria.

## OBJETIVO

Hacer que los presupuestos sean independientes de las obras. Un usuario debe poder crear un presupuesto directamente, opcionalmente asociarlo a un cliente, y opcionalmente vincularlo a una obra después. El flujo principal debe ser: "quiero presupuestar un trabajo" → describe → genera con IA → listo.

Hazlo paso a paso, confirmando conmigo antes de cada fase.

## FASE 1: Modificar la base de datos

### Tabla `estimates`
- El campo `project_id` debe pasar a ser **opcional** (nullable). Un presupuesto puede existir sin obra.
- Añadir campo `client_id` (UUID, FK a clients, nullable). Un presupuesto puede asociarse directamente a un cliente sin pasar por una obra.
- Añadir campo `description` (TEXT, nullable) para guardar la descripción del trabajo que se le pasó a la IA.
- Asegurar que las RLS policies permitan acceder a presupuestos que no tienen project_id (actualmente si el RLS filtra a través de projects → user_id, los presupuestos sin obra no serán accesibles).
- La RLS debe funcionar así: el presupuesto pertenece al usuario si `user_id = auth.uid()` (añadir campo `user_id` directamente en estimates si no existe).

### SQL de migración
- Crear archivo `sql/decouple_estimates.sql` con la migración necesaria.
- NO borrar la relación con projects, solo hacerla opcional.

## FASE 2: Crear página de nuevo presupuesto

### Nueva ruta: `/dashboard/presupuestos/nuevo`
- Página con el formulario de generación de presupuesto con IA (reutilizar/adaptar `GenerateEstimateForm`)
- El formulario debe tener:
  - **Cliente** (dropdown opcional): seleccionar un cliente existente o dejarlo vacío
  - **Obra** (dropdown opcional): si se selecciona un cliente, mostrar sus obras como opción. Si no, permitir dejarlo vacío
  - **Tipo de obra** (dropdown): reforma integral, baño, cocina, fontanería, electricidad, etc. (ya existe)
  - **Descripción del trabajo** (textarea obligatorio): lo que se envía a la IA
  - **Botón "Generar con IA"**: genera las partidas
  - **Vista previa**: tabla de partidas con totales (ya existe en el componente actual)
  - **Botón "Guardar"**: guarda el presupuesto en BD
- El dropdown de obras debe ser dinámico: si el usuario selecciona un cliente, filtrar las obras de ese cliente. Si no selecciona cliente, mostrar todas sus obras.

### Botón de acceso visible
- En `/dashboard/presupuestos/page.tsx`: añadir un botón prominente **"Nuevo Presupuesto"** en la cabecera (al lado del título), que lleve a `/dashboard/presupuestos/nuevo`
- En el dashboard principal (`/dashboard/page.tsx`): el botón "Crear Presupuesto" de acciones rápidas debe llevar a `/dashboard/presupuestos/nuevo`
- En la sidebar: el enlace "Presupuestos" ya existe, no tocar

## FASE 3: Actualizar la API de generación con IA

### `/app/api/generate-estimate/route.ts`
- `project_id` pasa a ser **opcional** en el body
- Si se envía `project_id`, verificar que pertenece al usuario (como ahora)
- Si NO se envía `project_id`, la generación funciona igual pero sin incluir datos de la obra en el prompt
- Añadir campo opcional `client_name` para incluir en el prompt si hay cliente seleccionado
- El prompt a la IA debe funcionar bien con o sin contexto de obra

### Server actions de presupuestos
- `createEstimateWithItemsAction`: aceptar `project_id` como opcional y `client_id` como nuevo campo opcional
- Guardar `user_id` directamente en el presupuesto
- Guardar la `description` (texto que se envió a la IA)

## FASE 4: Actualizar la página de detalle de presupuesto

### `/dashboard/presupuestos/[id]/page.tsx`
- Mostrar el cliente asociado (puede venir directo del presupuesto o a través de la obra)
- Mostrar la obra asociada si existe, o "Sin obra asignada" con un botón/dropdown para **vincular a una obra existente o crear una nueva**
- Añadir una acción "Vincular a obra" que permita al usuario seleccionar una obra existente del mismo cliente, o crear una obra nueva directamente desde ahí
- El botón de exportar PDF debe funcionar con o sin obra asociada
- Mantener el editor de partidas, cambio de estado, etc.

## FASE 5: Mantener compatibilidad con obras

### En `/dashboard/obras/[id]/page.tsx`
- Mantener el formulario de "Generar presupuesto con IA" que ya existe ahí — pero ahora al crear el presupuesto desde una obra, se pre-rellena el `project_id` y el `client_id` automáticamente
- La tabla de presupuestos de la obra debe seguir mostrando los presupuestos vinculados
- Añadir opción de "Vincular presupuesto existente" para asociar un presupuesto que se creó independientemente

## FASE 6: Actualizar las queries de datos

### `lib/data/estimates.ts`
- `getEstimates()`: debe poder filtrar por `project_id`, `client_id`, o traer todos los del usuario
- Los presupuestos sin obra deben aparecer en la lista general de presupuestos
- Incluir datos del cliente directo (no solo a través de project → client)
- Ordenar por fecha de creación (más recientes primero)

### `lib/data/dashboard.ts`
- Las estadísticas del dashboard deben contar todos los presupuestos del usuario, tengan o no obra asociada

## FASE 7: Pequeña mejora de UX futura (solo UI, no implementar lógica)

- En la vista de detalle de presupuesto, debajo de la tabla de partidas, añadir un banner/card sutil con el texto:
  "🚀 Próximamente: convierte las partidas de este presupuesto en tareas de obra para gestionar la ejecución paso a paso."
- Estilo: fondo `bg-slate-50`, borde `border-slate-200`, texto `text-slate-500`, tamaño `text-sm`. Discreto pero visible.

## NOTAS TÉCNICAS

- Seguir los patrones existentes: server actions, validación, revalidatePath
- Todo en español (UI), inglés (código/BD)
- No romper la funcionalidad existente de presupuestos creados desde obras
- Los presupuestos existentes en BD que ya tienen `project_id` deben seguir funcionando sin cambios
- Hacer commit descriptivo y push al final de cada fase
- Cada fase debe compilar y funcionar antes de pasar a la siguiente

## ORDEN DE EJECUCIÓN

1. Fase 1 (BD) → confirmar
2. Fase 2 (página nuevo presupuesto) → confirmar
3. Fase 3 (API + actions) → confirmar
4. Fase 4 (detalle presupuesto) → confirmar
5. Fase 5 (compatibilidad obras) → confirmar
6. Fase 6 (queries) → confirmar
7. Fase 7 (banner próximamente) → confirmar
