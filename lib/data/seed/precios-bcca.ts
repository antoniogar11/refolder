/**
 * Precios de referencia basados en la BCCA (Base de Costes de la Construcción de Andalucía)
 * Actualizados al mercado real español 2025/2026 (post-inflación materiales)
 *
 * Estructura: { codigo, descripcion, unidad, precio (EUR), categoria }
 */

export type PrecioReferenciaSeed = {
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  categoria: string;
};

export const preciosBCCA: PrecioReferenciaSeed[] = [
  // ── Demolición y retirada ──────────────────────────────────────
  { codigo: "DEM-001", descripcion: "Demolición de tabique de ladrillo hueco sencillo", unidad: "m²", precio: 8.50, categoria: "Demolición" },
  { codigo: "DEM-002", descripcion: "Demolición de tabique de ladrillo hueco doble", unidad: "m²", precio: 10.50, categoria: "Demolición" },
  { codigo: "DEM-003", descripcion: "Demolición de solado cerámico con retirada", unidad: "m²", precio: 12.00, categoria: "Demolición" },
  { codigo: "DEM-004", descripcion: "Demolición de alicatado cerámico con retirada", unidad: "m²", precio: 11.00, categoria: "Demolición" },
  { codigo: "DEM-005", descripcion: "Demolición de falso techo de escayola", unidad: "m²", precio: 8.00, categoria: "Demolición" },
  { codigo: "DEM-006", descripcion: "Desmontaje de sanitarios (inodoro, lavabo o bidé)", unidad: "ud", precio: 25.00, categoria: "Demolición" },
  { codigo: "DEM-007", descripcion: "Desmontaje de bañera o plato de ducha", unidad: "ud", precio: 45.00, categoria: "Demolición" },
  { codigo: "DEM-008", descripcion: "Desmontaje de puerta interior con marco", unidad: "ud", precio: 18.00, categoria: "Demolición" },
  { codigo: "DEM-009", descripcion: "Desmontaje de ventana con marco", unidad: "ud", precio: 22.00, categoria: "Demolición" },
  { codigo: "DEM-010", descripcion: "Retirada de instalación eléctrica existente", unidad: "ml", precio: 4.80, categoria: "Demolición" },
  { codigo: "DEM-011", descripcion: "Retirada de escombros con contenedor", unidad: "m³", precio: 45.00, categoria: "Demolición" },
  { codigo: "DEM-012", descripcion: "Picado de enfoscado en paramentos", unidad: "m²", precio: 9.50, categoria: "Demolición" },
  { codigo: "DEM-013", descripcion: "Desmontaje de cocina completa (muebles y electrodomésticos)", unidad: "ud", precio: 380.00, categoria: "Demolición" },
  { codigo: "DEM-014", descripcion: "Apertura de hueco en muro de carga (incluye apeo)", unidad: "ud", precio: 1200.00, categoria: "Demolición" },

  // ── Albañilería ────────────────────────────────────────────────
  { codigo: "ALB-001", descripcion: "Enfoscado maestreado en paramentos verticales", unidad: "m²", precio: 22.00, categoria: "Albañilería" },
  { codigo: "ALB-002", descripcion: "Guarnecido y enlucido de yeso en paramentos", unidad: "m²", precio: 17.00, categoria: "Albañilería" },
  { codigo: "ALB-003", descripcion: "Tabique de ladrillo hueco doble", unidad: "m²", precio: 30.00, categoria: "Albañilería" },
  { codigo: "ALB-004", descripcion: "Tabique de ladrillo hueco sencillo", unidad: "m²", precio: 24.00, categoria: "Albañilería" },
  { codigo: "ALB-005", descripcion: "Tabiquería de pladur con perfilería (15+46+15)", unidad: "m²", precio: 35.00, categoria: "Albañilería" },
  { codigo: "ALB-006", descripcion: "Trasdosado de pladur directo a muro", unidad: "m²", precio: 28.00, categoria: "Albañilería" },
  { codigo: "ALB-007", descripcion: "Recibido de cercos de puertas con mortero", unidad: "ud", precio: 32.00, categoria: "Albañilería" },
  { codigo: "ALB-008", descripcion: "Formación de mocheta para ventana", unidad: "ml", precio: 20.00, categoria: "Albañilería" },
  { codigo: "ALB-009", descripcion: "Falso techo continuo de placa de yeso laminado", unidad: "m²", precio: 32.00, categoria: "Albañilería" },
  { codigo: "ALB-010", descripcion: "Falso techo registrable de escayola 60x60", unidad: "m²", precio: 28.00, categoria: "Albañilería" },
  { codigo: "ALB-011", descripcion: "Recrecido y nivelación de suelo con mortero (espesor medio 3cm)", unidad: "m²", precio: 16.00, categoria: "Albañilería" },
  { codigo: "ALB-012", descripcion: "Ayudas de albañilería a instalaciones", unidad: "ud", precio: 550.00, categoria: "Albañilería" },
  { codigo: "ALB-013", descripcion: "Formación de bañera de obra con impermeabilización", unidad: "ud", precio: 480.00, categoria: "Albañilería" },

  // ── Solados y alicatados ───────────────────────────────────────
  { codigo: "SOL-001", descripcion: "Solado de gres porcelánico rectificado 60x60", unidad: "m²", precio: 42.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-002", descripcion: "Solado de gres porcelánico 45x45", unidad: "m²", precio: 36.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-003", descripcion: "Alicatado de azulejo cerámico 30x60", unidad: "m²", precio: 34.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-004", descripcion: "Alicatado de gres porcelánico rectificado", unidad: "m²", precio: 45.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-005", descripcion: "Rodapié cerámico", unidad: "ml", precio: 11.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-006", descripcion: "Suelo laminado AC4 con base aislante", unidad: "m²", precio: 30.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-007", descripcion: "Suelo vinílico tipo click (SPC/LVT)", unidad: "m²", precio: 35.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-008", descripcion: "Microcemento en suelos (sistema completo)", unidad: "m²", precio: 78.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-009", descripcion: "Microcemento en paredes (sistema completo)", unidad: "m²", precio: 65.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-010", descripcion: "Nivelación autonivelante para suelo (espesor 3mm)", unidad: "m²", precio: 13.00, categoria: "Solados y Alicatados" },
  { codigo: "SOL-011", descripcion: "Mosaico hidráulico decorativo", unidad: "m²", precio: 60.00, categoria: "Solados y Alicatados" },

  // ── Fontanería ─────────────────────────────────────────────────
  { codigo: "FON-001", descripcion: "Instalación completa de fontanería para baño (agua fría y caliente)", unidad: "ud", precio: 1050.00, categoria: "Fontanería" },
  { codigo: "FON-002", descripcion: "Instalación completa de fontanería para cocina", unidad: "ud", precio: 800.00, categoria: "Fontanería" },
  { codigo: "FON-003", descripcion: "Instalación de inodoro completo (suministro y colocación)", unidad: "ud", precio: 390.00, categoria: "Fontanería" },
  { codigo: "FON-004", descripcion: "Instalación de lavabo con pedestal o mueble", unidad: "ud", precio: 350.00, categoria: "Fontanería" },
  { codigo: "FON-005", descripcion: "Instalación de plato de ducha con grifería", unidad: "ud", precio: 550.00, categoria: "Fontanería" },
  { codigo: "FON-006", descripcion: "Instalación de bañera con grifería", unidad: "ud", precio: 650.00, categoria: "Fontanería" },
  { codigo: "FON-007", descripcion: "Instalación de bidé completo", unidad: "ud", precio: 310.00, categoria: "Fontanería" },
  { codigo: "FON-008", descripcion: "Instalación de fregadero de cocina con grifería", unidad: "ud", precio: 350.00, categoria: "Fontanería" },
  { codigo: "FON-009", descripcion: "Tubería de cobre para agua (diámetro 15mm)", unidad: "ml", precio: 22.00, categoria: "Fontanería" },
  { codigo: "FON-010", descripcion: "Tubería multicapa PEX para agua", unidad: "ml", precio: 15.00, categoria: "Fontanería" },
  { codigo: "FON-011", descripcion: "Desagüe de PVC (diámetro 110mm)", unidad: "ml", precio: 18.00, categoria: "Fontanería" },
  { codigo: "FON-012", descripcion: "Desagüe de PVC (diámetro 40mm)", unidad: "ml", precio: 11.00, categoria: "Fontanería" },
  { codigo: "FON-013", descripcion: "Punto de desagüe de lavadora o lavavajillas", unidad: "ud", precio: 80.00, categoria: "Fontanería" },
  { codigo: "FON-014", descripcion: "Instalación de calentador o termo eléctrico", unidad: "ud", precio: 220.00, categoria: "Fontanería" },
  { codigo: "FON-015", descripcion: "Mampara de ducha fija o corredera", unidad: "ud", precio: 420.00, categoria: "Fontanería" },
  { codigo: "FON-016", descripcion: "Inodoro suspendido con cisterna empotrada", unidad: "ud", precio: 720.00, categoria: "Fontanería" },

  // ── Electricidad ───────────────────────────────────────────────
  { codigo: "ELE-001", descripcion: "Punto de luz sencillo (cableado + mecanismo)", unidad: "ud", precio: 68.00, categoria: "Electricidad" },
  { codigo: "ELE-002", descripcion: "Punto de luz conmutado", unidad: "ud", precio: 92.00, categoria: "Electricidad" },
  { codigo: "ELE-003", descripcion: "Base de enchufe 16A (cableado + mecanismo)", unidad: "ud", precio: 60.00, categoria: "Electricidad" },
  { codigo: "ELE-004", descripcion: "Toma de TV/datos (cableado + mecanismo)", unidad: "ud", precio: 65.00, categoria: "Electricidad" },
  { codigo: "ELE-005", descripcion: "Cuadro eléctrico vivienda completo (hasta 10 circuitos)", unidad: "ud", precio: 480.00, categoria: "Electricidad" },
  { codigo: "ELE-006", descripcion: "Circuito eléctrico nuevo (cableado completo)", unidad: "ud", precio: 220.00, categoria: "Electricidad" },
  { codigo: "ELE-007", descripcion: "Instalación eléctrica completa vivienda (hasta 80m²)", unidad: "ud", precio: 3800.00, categoria: "Electricidad" },
  { codigo: "ELE-008", descripcion: "Downlight LED empotrado", unidad: "ud", precio: 42.00, categoria: "Electricidad" },
  { codigo: "ELE-009", descripcion: "Tira LED con perfil de aluminio", unidad: "ml", precio: 35.00, categoria: "Electricidad" },
  { codigo: "ELE-010", descripcion: "Mecanismo eléctrico (interruptor/enchufe) gama media", unidad: "ud", precio: 15.00, categoria: "Electricidad" },
  { codigo: "ELE-011", descripcion: "Cableado eléctrico en tubo corrugado empotrado", unidad: "ml", precio: 11.00, categoria: "Electricidad" },
  { codigo: "ELE-012", descripcion: "Punto de conexión para aire acondicionado", unidad: "ud", precio: 150.00, categoria: "Electricidad" },
  { codigo: "ELE-013", descripcion: "Extractor de baño con temporizador", unidad: "ud", precio: 105.00, categoria: "Electricidad" },

  // ── Pintura ────────────────────────────────────────────────────
  { codigo: "PIN-001", descripcion: "Pintura plástica lisa en paramentos verticales (2 manos)", unidad: "m²", precio: 10.00, categoria: "Pintura" },
  { codigo: "PIN-002", descripcion: "Pintura plástica lisa en techos (2 manos)", unidad: "m²", precio: 11.50, categoria: "Pintura" },
  { codigo: "PIN-003", descripcion: "Esmalte sintético sobre carpintería de madera", unidad: "m²", precio: 17.00, categoria: "Pintura" },
  { codigo: "PIN-004", descripcion: "Esmalte sobre carpintería metálica", unidad: "m²", precio: 15.00, categoria: "Pintura" },
  { codigo: "PIN-005", descripcion: "Imprimación selladora", unidad: "m²", precio: 4.50, categoria: "Pintura" },
  { codigo: "PIN-006", descripcion: "Alisado y preparación de paramentos para pintura", unidad: "m²", precio: 8.00, categoria: "Pintura" },
  { codigo: "PIN-007", descripcion: "Papel pintado con preparación de superficie", unidad: "m²", precio: 28.00, categoria: "Pintura" },
  { codigo: "PIN-008", descripcion: "Pintura decorativa estuco o efecto", unidad: "m²", precio: 35.00, categoria: "Pintura" },
  { codigo: "PIN-009", descripcion: "Lacado de puertas (ambas caras)", unidad: "ud", precio: 150.00, categoria: "Pintura" },

  // ── Carpintería ────────────────────────────────────────────────
  { codigo: "CAR-001", descripcion: "Puerta interior abatible lisa lacada en blanco", unidad: "ud", precio: 390.00, categoria: "Carpintería" },
  { codigo: "CAR-002", descripcion: "Puerta interior corredera con guía oculta", unidad: "ud", precio: 580.00, categoria: "Carpintería" },
  { codigo: "CAR-003", descripcion: "Puerta de entrada blindada", unidad: "ud", precio: 1100.00, categoria: "Carpintería" },
  { codigo: "CAR-004", descripcion: "Armario empotrado de 2 hojas correderas (frente completo)", unidad: "ml", precio: 460.00, categoria: "Carpintería" },
  { codigo: "CAR-005", descripcion: "Armario empotrado de 2 hojas abatibles (frente completo)", unidad: "ml", precio: 420.00, categoria: "Carpintería" },
  { codigo: "CAR-006", descripcion: "Ventana de aluminio con rotura de puente térmico y doble cristal", unidad: "m²", precio: 340.00, categoria: "Carpintería" },
  { codigo: "CAR-007", descripcion: "Ventana de PVC con doble cristal", unidad: "m²", precio: 300.00, categoria: "Carpintería" },
  { codigo: "CAR-008", descripcion: "Puerta balconera de aluminio con RPT", unidad: "m²", precio: 380.00, categoria: "Carpintería" },
  { codigo: "CAR-009", descripcion: "Persiana de aluminio motorizada", unidad: "m²", precio: 220.00, categoria: "Carpintería" },
  { codigo: "CAR-010", descripcion: "Moldura de escayola o poliuretano decorativa", unidad: "ml", precio: 15.00, categoria: "Carpintería" },
  { codigo: "CAR-011", descripcion: "Premarco de madera para puerta interior", unidad: "ud", precio: 35.00, categoria: "Carpintería" },

  // ── Impermeabilización ─────────────────────────────────────────
  { codigo: "IMP-001", descripcion: "Impermeabilización de plato de ducha con lámina", unidad: "m²", precio: 28.00, categoria: "Impermeabilización" },
  { codigo: "IMP-002", descripcion: "Impermeabilización de cubierta plana con tela asfáltica", unidad: "m²", precio: 35.00, categoria: "Impermeabilización" },
  { codigo: "IMP-003", descripcion: "Impermeabilización líquida en baños", unidad: "m²", precio: 20.00, categoria: "Impermeabilización" },
  { codigo: "IMP-004", descripcion: "Impermeabilización de terraza transitable", unidad: "m²", precio: 42.00, categoria: "Impermeabilización" },
  { codigo: "IMP-005", descripcion: "Banda impermeable para juntas y esquinas", unidad: "ml", precio: 8.50, categoria: "Impermeabilización" },

  // ── Cerrajería y metalistería ──────────────────────────────────
  { codigo: "CER-001", descripcion: "Barandilla de acero inoxidable con vidrio", unidad: "ml", precio: 220.00, categoria: "Cerrajería" },
  { codigo: "CER-002", descripcion: "Barandilla de hierro forjado", unidad: "ml", precio: 150.00, categoria: "Cerrajería" },
  { codigo: "CER-003", descripcion: "Reja de seguridad para ventana", unidad: "m²", precio: 120.00, categoria: "Cerrajería" },
  { codigo: "CER-004", descripcion: "Estructura metálica para altillo o entreplanta", unidad: "m²", precio: 220.00, categoria: "Cerrajería" },
  { codigo: "CER-005", descripcion: "Escalera metálica de tramo recto", unidad: "ud", precio: 2800.00, categoria: "Cerrajería" },

  // ── Instalaciones (climatización, gas, ventilación) ─────────────
  { codigo: "INS-001", descripcion: "Instalación de aire acondicionado split (hasta 3.5kW)", unidad: "ud", precio: 1100.00, categoria: "Instalaciones" },
  { codigo: "INS-002", descripcion: "Instalación de aire acondicionado split (hasta 5kW)", unidad: "ud", precio: 1450.00, categoria: "Instalaciones" },
  { codigo: "INS-003", descripcion: "Instalación de caldera de gas condensación", unidad: "ud", precio: 2600.00, categoria: "Instalaciones" },
  { codigo: "INS-004", descripcion: "Radiador de aluminio (por elemento)", unidad: "ud", precio: 35.00, categoria: "Instalaciones" },
  { codigo: "INS-005", descripcion: "Suelo radiante (instalación completa)", unidad: "m²", precio: 68.00, categoria: "Instalaciones" },
  { codigo: "INS-006", descripcion: "Tubería de cobre para gas", unidad: "ml", precio: 28.00, categoria: "Instalaciones" },
  { codigo: "INS-007", descripcion: "Conducto de ventilación en aluminio flexible", unidad: "ml", precio: 18.00, categoria: "Instalaciones" },
  { codigo: "INS-008", descripcion: "Aerotermia (bomba de calor aire-agua)", unidad: "ud", precio: 5800.00, categoria: "Instalaciones" },
  { codigo: "INS-009", descripcion: "Toallero eléctrico de baño", unidad: "ud", precio: 150.00, categoria: "Instalaciones" },

  // ── Cocina ─────────────────────────────────────────────────────
  { codigo: "COC-001", descripcion: "Mueble bajo de cocina (módulo 60cm)", unidad: "ud", precio: 220.00, categoria: "Cocina" },
  { codigo: "COC-002", descripcion: "Mueble alto de cocina (módulo 60cm)", unidad: "ud", precio: 185.00, categoria: "Cocina" },
  { codigo: "COC-003", descripcion: "Mueble columna de cocina", unidad: "ud", precio: 400.00, categoria: "Cocina" },
  { codigo: "COC-004", descripcion: "Encimera de cuarzo compacto", unidad: "ml", precio: 220.00, categoria: "Cocina" },
  { codigo: "COC-005", descripcion: "Encimera de granito natural", unidad: "ml", precio: 185.00, categoria: "Cocina" },
  { codigo: "COC-006", descripcion: "Encimera de laminado HPL", unidad: "ml", precio: 105.00, categoria: "Cocina" },
  { codigo: "COC-007", descripcion: "Instalación de placa de inducción", unidad: "ud", precio: 150.00, categoria: "Cocina" },
  { codigo: "COC-008", descripcion: "Instalación de horno empotrado", unidad: "ud", precio: 100.00, categoria: "Cocina" },
  { codigo: "COC-009", descripcion: "Instalación de campana extractora", unidad: "ud", precio: 185.00, categoria: "Cocina" },
  { codigo: "COC-010", descripcion: "Instalación de lavavajillas empotrado", unidad: "ud", precio: 105.00, categoria: "Cocina" },

  // ── Limpieza y finalización ────────────────────────────────────
  { codigo: "LIM-001", descripcion: "Limpieza final de obra en vivienda", unidad: "m²", precio: 5.50, categoria: "Limpieza" },
  { codigo: "LIM-002", descripcion: "Limpieza de cristales post-obra", unidad: "m²", precio: 4.00, categoria: "Limpieza" },
  { codigo: "LIM-003", descripcion: "Gestión de residuos y escombros", unidad: "m³", precio: 42.00, categoria: "Limpieza" },

  // ── Varios / Seguridad ─────────────────────────────────────────
  { codigo: "VAR-001", descripcion: "Protección de zonas no afectadas por la obra", unidad: "m²", precio: 4.50, categoria: "Varios" },
  { codigo: "VAR-002", descripcion: "Montaje y desmontaje de andamio interior", unidad: "ud", precio: 300.00, categoria: "Varios" },
  { codigo: "VAR-003", descripcion: "Licencia y tasas municipales de obra menor", unidad: "ud", precio: 420.00, categoria: "Varios" },
  { codigo: "VAR-004", descripcion: "Proyecto técnico para obra menor", unidad: "ud", precio: 750.00, categoria: "Varios" },
  { codigo: "VAR-005", descripcion: "Estudio de seguridad y salud", unidad: "ud", precio: 480.00, categoria: "Varios" },
];
