# Mejoras Futuras - Refolder

Documento de trabajo para ir apuntando ideas y mejoras pendientes.
Actualizado: 21 febrero 2026

---

## PRIORIDAD ALTA (Pre-lanzamiento)

### Portal del cliente - Aceptar/Rechazar presupuesto
- [ ] Botones "Aceptar" / "Rechazar" en la vista publica `/presupuesto/[token]`
- [ ] Cuando el cliente acepta/rechaza, actualizar el estado del presupuesto automaticamente
- [ ] Notificar al profesional por email cuando el cliente responde
- [ ] Registro de cuando y quien acepto/rechazo (audit trail)

### Configurar Resend para emails en produccion
- [ ] Crear cuenta en resend.com
- [ ] Verificar dominio refolder.es
- [ ] Configurar variables RESEND_API_KEY y RESEND_DOMAIN en produccion
- [ ] Disenar plantilla de email mas elaborada (con logo de la empresa)

### Onboarding primera vez
- [ ] Wizard de configuracion al registrarse (nombre empresa, CIF, direccion)
- [ ] Tour guiado por las secciones principales
- [ ] Pantalla de bienvenida con "Crea tu primer presupuesto"
- [ ] Template de presupuesto de ejemplo pre-cargado

### Facturacion basica
- [ ] Convertir presupuesto aceptado en factura
- [ ] Numeracion automatica de facturas (FAC-2026-001)
- [ ] Exportar factura a PDF
- [ ] Registro de facturas emitidas

---

## PRIORIDAD MEDIA (Post-lanzamiento fase 1)

### Mejoras en el portal publico del presupuesto
- [ ] Descargar PDF directamente desde el portal publico
- [ ] Version imprimible optimizada (CSS print)
- [ ] Comentarios del cliente en el presupuesto
- [ ] Firma digital del cliente para aceptacion formal

### Dashboard mejorado
- [ ] Grafico de presupuestos por mes (aceptados vs rechazados)
- [ ] Grafico de ingresos/gastos por proyecto
- [ ] Indicadores clave: tasa de aceptacion, ticket medio, tiempo medio de respuesta
- [ ] Vista calendario de obras en progreso

### Notificaciones
- [ ] Notificaciones push (PWA) cuando un cliente acepta/rechaza
- [ ] Recordatorio cuando un presupuesto esta a punto de caducar
- [ ] Alerta cuando un proyecto supera el presupuesto
- [ ] Resumen semanal por email

### Gestion de clientes mejorada
- [ ] Historial completo de presupuestos por cliente
- [ ] Notas y seguimiento de comunicaciones
- [ ] Importar clientes desde contactos del telefono
- [ ] Etiquetas/categorias para clientes

### Plantillas de presupuesto
- [ ] Guardar presupuesto como plantilla reutilizable
- [ ] Biblioteca de plantillas por tipo de obra (bano, cocina, pintura...)
- [ ] Plantillas compartidas entre usuarios (marketplace)

---

## PRIORIDAD BAJA (Futuro)

### IA avanzada
- [ ] Analisis de fotos mas inteligente (medir superficies desde foto)
- [ ] Sugerencias automaticas: "Otros clientes tambien incluyeron..."
- [ ] Deteccion de precios anomalos en el presupuesto
- [ ] Generacion de planning de obra a partir del presupuesto
- [ ] Chat con IA para resolver dudas sobre presupuestos

### Integraciones
- [ ] Integracion con software de contabilidad (Holded, Billin, Debitoor)
- [ ] Integracion con almacenes de materiales (precios en tiempo real)
- [ ] Sincronizacion con Google Calendar para planificacion
- [ ] API publica para integraciones de terceros

### Multiusuario / Equipos
- [ ] Invitar a otros miembros del equipo
- [ ] Roles: admin, presupuestador, operario (solo lectura)
- [ ] Asignar presupuestos/proyectos a miembros del equipo
- [ ] Chat interno por proyecto

### Seguimiento de obra
- [ ] Fotos de progreso por zona/capitulo
- [ ] Checklist de tareas por partida
- [ ] Partes de trabajo diarios
- [ ] Control de certificaciones de obra

### Landing page y marketing
- [ ] Landing page profesional con testimonios
- [ ] Blog con consejos para profesionales de reformas
- [ ] Calculadora publica de presupuestos (lead magnet)
- [ ] Programa de referidos

### Monetizacion
- [ ] Plan gratuito limitado (3 presupuestos/mes)
- [ ] Plan Pro: presupuestos ilimitados, logo personalizado, dominio propio
- [ ] Plan Business: multiusuario, integraciones, soporte prioritario
- [ ] Stripe checkout para suscripciones

---

## IDEAS SUELTAS

- Modo offline para crear presupuestos sin conexion (PWA + IndexedDB)
- Escanear ticket/albaran con la camara y extraer datos con IA
- Comparador de presupuestos (comparar 2 versiones del mismo presupuesto)
- QR code en el PDF del presupuesto que lleva al portal publico
- Historico de cambios en un presupuesto (versionado)
- Exportar presupuesto a Excel/CSV
- Importar partidas desde Excel
- Modo presentacion para ensenaral presupuesto al cliente en persona
- Firma manuscrita en el movil para la aceptacion
- Calendario de pagos asociado al presupuesto
- Alertas de vencimiento de presupuestos enviados

---

## BUGS CONOCIDOS

_(Apuntar aqui cualquier bug que encontremos)_

- Ninguno reportado actualmente

---

## NOTAS TECNICAS

### Configuracion necesaria para produccion
```
RESEND_API_KEY=re_xxxxx          # API key de Resend
RESEND_DOMAIN=refolder.es        # Dominio verificado en Resend
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # Para portal publico de presupuestos
NEXT_PUBLIC_APP_URL=https://refolder.es  # URL de produccion
```

### Migraciones pendientes de ejecutar
```bash
npx supabase migration up --linked
# Incluye: 20260223_estimate_sharing.sql (share_token + shared_at)
```
