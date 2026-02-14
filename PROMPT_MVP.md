# Prompt para Claude Code — Refolder MVP

Copia y pega esto en Claude Code desde la raíz del proyecto `/refolder`:

---

## CONTEXTO

Refolder es una app SaaS en Next.js 15 (App Router) + Supabase + TailwindCSS + shadcn/ui para que autónomos y pequeñas empresas de construcción/reformas generen presupuestos profesionales con ayuda de IA. La interfaz está en español.

El proyecto ya tiene funcionando: autenticación (login/register/logout), CRUD completo de clientes, landing page, y módulos placeholder (obras, presupuestos, proveedores, finanzas) que solo tienen UI estática.

## OBJETIVO

Transformar esto en un MVP funcional centrado en el flujo principal: **Cliente → Obra → Presupuesto con IA → Edición → PDF**. Hazlo paso a paso, confirmando conmigo antes de cada fase.

## FASE 1: Ocultar módulos no prioritarios

- En el dashboard (`/dashboard/page.tsx`), oculta las tarjetas de navegación a **Proveedores** y **Finanzas** (no borres las páginas ni el código, solo que no aparezcan en el dashboard). Puedes envolverlas en un comentario o en un condicional `{false && ...}`.
- Si hay enlaces a proveedores/finanzas en algún layout o sidebar, ocúltalos también.
- Las rutas `/dashboard/proveedores` y `/dashboard/finanzas` deben seguir existiendo pero no ser accesibles desde la navegación.

## FASE 2: CRUD de Obras (Proyectos)

Implementar el módulo de obras completo siguiendo exactamente el mismo patrón que ya existe en `/dashboard/clientes`:

### Base de datos
- Usar la tabla `projects` del schema que ya existe en `/sql/create_tables.sql`
- Campos: name, description, address, client_id (FK a clients), status (planning/in_progress/paused/completed/cancelled), start_date, estimated_end_date, total_budget
- RLS: usuarios solo ven sus propios proyectos
- El campo `client_id` debe ser obligatorio — toda obra pertenece a un cliente

### Código necesario
- `lib/data/projects.ts` — funciones `getProjects()`, `getProjectById(id)`, `getProjectsByClientId(clientId)`
- `app/dashboard/obras/actions.ts` — server actions: `createProjectAction`, `updateProjectAction`, `deleteProjectAction` con validación
- `app/dashboard/obras/page.tsx` — lista de obras con nombre, cliente asociado, estado (badge de color), fecha inicio
- `app/dashboard/obras/[id]/page.tsx` — detalle y edición de obra
- `components/projects/new-project-form.tsx` — formulario con selector de cliente (dropdown con los clientes del usuario)
- `components/projects/edit-project-form.tsx` — formulario de edición
- `components/projects/delete-project-button.tsx` — botón de borrado con confirmación
- Añadir tipo `Project` en los types si no encaja con el existente `Obra`

### UX
- En la lista de obras, mostrar el nombre del cliente asociado
- El selector de cliente debe cargar los clientes del usuario desde la BD
- Los estados deben mostrarse con badges de colores (planificación=azul, en curso=verde, pausada=amarillo, finalizada=gris, cancelada=rojo)

## FASE 3: Generación de presupuestos con IA

Este es el **core del producto**. El flujo es:

1. El usuario va a una obra y hace clic en "Generar presupuesto"
2. Se abre un formulario donde describe el trabajo en texto libre (ejemplo: "Reforma completa de baño de 6m2, cambio de plato de ducha, alicatado completo, instalación de mueble de baño y espejo, nueva grifería")
3. La app envía esa descripción a la API de OpenAI (GPT-4o) o Anthropic (Claude)
4. La IA devuelve un JSON estructurado con partidas desglosadas:
   ```json
   {
     "partidas": [
       {
         "categoria": "Demolición",
         "descripcion": "Demolición de alicatado existente y retirada de sanitarios",
         "unidad": "m²",
         "cantidad": 24,
         "precio_unitario": 12.50,
         "subtotal": 300.00
       },
       ...
     ],
     "subtotal": 4500.00,
     "iva": 945.00,
     "total": 5445.00
   }
   ```
5. El presupuesto se guarda en la BD vinculado a la obra

### Base de datos
- Tabla `estimates` (ya definida en schema) para la cabecera del presupuesto
- Crear tabla `estimate_items` para las partidas:
  - id, estimate_id (FK), categoria, descripcion, unidad, cantidad, precio_unitario, subtotal, orden
  - RLS a través de la relación con estimates → projects → user_id

### API Route
- `app/api/generate-estimate/route.ts`
- Recibe: project_id, descripcion del trabajo (texto libre), y opcionalmente el tipo de obra
- Envía prompt a la API de IA con instrucciones para devolver JSON de partidas con precios realistas del mercado español
- El prompt del sistema debe incluir contexto de que es para el mercado español de construcción/reformas y debe dar precios realistas
- Variable de entorno: `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` (pregúntame cuál prefiero usar)
- Manejar errores y timeouts (la generación puede tardar 10-20s)

### UI del presupuesto
- `app/dashboard/presupuestos/[id]/page.tsx` — vista del presupuesto generado
- Tabla editable con las partidas: el usuario puede modificar cantidades, precios, añadir/eliminar partidas manualmente
- Mostrar subtotal, IVA (21%) y total que se recalculan en tiempo real
- Botón "Regenerar con IA" para volver a generar
- Botón "Exportar PDF"
- Estado del presupuesto: borrador, enviado, aceptado, rechazado

### Server actions para presupuestos
- `createEstimateAction` — crea cabecera + partidas
- `updateEstimateItemAction` — actualiza una partida individual
- `addEstimateItemAction` — añade partida manual
- `deleteEstimateItemAction` — elimina partida
- `updateEstimateStatusAction` — cambia estado del presupuesto

## FASE 4: Exportación a PDF

- Cuando el usuario hace clic en "Exportar PDF", generar un PDF profesional del presupuesto
- Usar la librería `jspdf` o `@react-pdf/renderer` (lo que mejor se integre con Next.js server-side)
- El PDF debe incluir:
  - Logo de Refolder (o placeholder) y datos de la empresa del usuario (por ahora hardcodeados o un campo simple)
  - Datos del cliente (nombre, dirección, CIF)
  - Datos de la obra (nombre, dirección)
  - Tabla de partidas con: categoría, descripción, unidad, cantidad, precio unitario, subtotal
  - Subtotal, IVA, Total
  - Fecha de emisión y fecha de validez (30 días por defecto)
  - Número de presupuesto (auto-incremental o basado en fecha)
  - Pie de página con condiciones básicas
- El PDF debe descargarse directamente en el navegador

## FASE 5: Conectar el flujo completo

- Desde la ficha de un cliente, poder ver sus obras
- Desde la ficha de una obra, poder ver sus presupuestos y generar uno nuevo
- En el dashboard principal, mostrar estadísticas básicas: nº de clientes, nº de obras activas, nº de presupuestos este mes, importe total presupuestado
- Añadir búsqueda simple (por nombre) en la lista de clientes y obras

## FASE 6: Simplificar la landing

- Reducir los planes de precio a 2: **Gratis** y **Pro** (eliminar Business)
- El plan Gratis: 3 presupuestos/mes, exportación PDF básica
- El plan Pro: €19.90/mes, presupuestos ilimitados, IA ilimitada, plantillas profesionales
- Actualizar el copy de la landing para reflejar que la app ya funciona (no es solo "próximamente")

## NOTAS TÉCNICAS IMPORTANTES

- Seguir los patrones existentes: server actions con `useActionState`, validación con objetos de errores, revalidatePath después de mutaciones
- Todo en español (labels, mensajes de error, placeholders)
- Mantener la consistencia de nombres: en la BD y código usar inglés (clients, projects, estimates), en la UI usar español
- NO borrar código existente de proveedores/finanzas, solo ocultar
- Cada fase debe compilar y funcionar antes de pasar a la siguiente
- Hacer commits descriptivos al final de cada fase

## ORDEN DE EJECUCIÓN

Ejecuta en este orden, confirmando conmigo al terminar cada fase:
1. Fase 1 (ocultar módulos) → confirmar
2. Fase 2 (CRUD obras) → confirmar
3. Fase 3 (generación IA) → confirmar
4. Fase 4 (PDF) → confirmar
5. Fase 5 (flujo completo) → confirmar
6. Fase 6 (landing) → confirmar
