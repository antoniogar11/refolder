# Tareas Pendientes - Refolder

Documento para saber que queda pendiente entre sesiones de trabajo.

---

## Nice-to-have (pueden esperar)

### 1. Tests de integracion y E2E
- Solo hay ~49 unit tests (utils + validaciones)
- Faltan tests de API routes, componentes y flujos completos
- Considerar Playwright para E2E

### 2. CI/CD con GitHub Actions
- No hay pipeline automatizado
- Crear workflows para: lint, test, build en cada PR
- `.github/workflows/ci.yml`

### 3. Metadata en paginas del dashboard
- Las paginas internas no tienen titulo propio en la pestana del navegador
- Anadir `export const metadata` a cada page.tsx del dashboard
- Ej: "Proyectos | Refolder", "Clientes | Refolder"

### 4. Validacion de telefono
- El campo de telefono acepta cualquier string
- Deberia validar formato espanol (9 digitos) o al menos solo numeros

### 5. Compresion de imagenes mas agresiva para IA
- Actualmente 1600px max, para analisis de IA bastaria con 512-800px
- Reduciria tiempo de envio y coste de tokens

### 6. Margen por defecto configurable
- El 20% esta hardcodeado en el codigo
- Deberia ser configurable desde Configuracion del usuario

### 7. Paginacion con contador
- Mostrar "Mostrando X de Y resultados" en listas

### 8. Duplicacion de formatCurrency en PDF
- `lib/pdf/generate-estimate-pdf.ts` tiene su propia version
- Deberia usar la de `lib/utils/format.ts`

### 9. Atajos de teclado
- Considerar Cmd+K para busqueda rapida
- Esc para cerrar modales (ya funciona con Radix)

### 10. Accesibilidad de toasts
- Verificar que Sonner anuncia los toasts a screen readers
- Puede necesitar `role="alert"` o similar

### 11. Tablas en movil
- Algunas columnas se ocultan en movil (email, CIF, tarea)
- Considerar vista de tarjetas en movil para tablas de gastos/ingresos/horas
- Similar a lo que se hizo con la vista previa del presupuesto

### 12. robots.txt y sitemap
- Falta robots.txt para SEO
- Falta sitemap.xml
- No critico si las paginas del dashboard estan detras de auth

---

## Ultima actualizacion: 2026-02-20
