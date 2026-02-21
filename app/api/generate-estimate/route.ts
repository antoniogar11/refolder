import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ratelimit } from "@/lib/rate-limit";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";
import { matchPreciosForDescription } from "@/lib/data/precios-referencia";
import type { PrecioReferencia } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_MARGIN = 20; // 20% margen por defecto

type Partida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  margen: number;
  precio_unitario: number;
  subtotal: number;
};

type AIPartida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  subtotal: number;
};

type AIResponse = {
  partidas: AIPartida[];
  subtotal: number;
  iva: number;
  total: number;
};

/**
 * Construye la sección de precios de referencia para el prompt de IA.
 */
function buildReferenceSection(precios: PrecioReferencia[]): string {
  if (precios.length === 0) return "";

  const grouped = new Map<string, PrecioReferencia[]>();
  for (const p of precios) {
    const existing = grouped.get(p.categoria) ?? [];
    existing.push(p);
    grouped.set(p.categoria, existing);
  }

  let section = "\n\nPRECIOS DE REFERENCIA BCCA (Base de Costes de la Construcción de Andalucía):\nUsa estos precios como guía orientativa para el coste base de cada partida.\n\n";

  for (const [categoria, items] of grouped) {
    section += `${categoria}:\n`;
    for (const item of items) {
      section += `  - ${item.codigo}: ${item.descripcion} (${item.unidad}): ${item.precio.toFixed(2)} EUR\n`;
    }
    section += "\n";
  }

  return section;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Rate limiting per user
    const { success } = await ratelimit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de generaciones por hora. Espera un poco e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Servicio de IA no disponible. Contacta al administrador." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { project_id, descripcion, tipo_obra, client_name, photos } = body as {
      project_id?: string;
      descripcion?: string;
      tipo_obra?: string;
      client_name?: string;
      photos?: { base64: string; mimeType: string; zoneName: string }[];
    };

    if (!descripcion) {
      return NextResponse.json(
        { error: "Falta el campo obligatorio: descripcion" },
        { status: 400 }
      );
    }

    // Optionally fetch the project if project_id is provided
    let project: { id: string; name: string; address: string } | null = null;
    if (project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, address")
        .eq("id", project_id)
        .eq("user_id", user.id)
        .single();

      if (projectError || !projectData) {
        return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 });
      }
      project = projectData;
    }

    // Buscar precios de referencia BCCA relevantes para la descripción
    const fullDescription = [tipo_obra, descripcion, project?.name].filter(Boolean).join(" ");

    let referencePrices: PrecioReferencia[] = [];
    try {
      referencePrices = await matchPreciosForDescription(fullDescription);
    } catch (err) {
      // Si falla la búsqueda de precios, continuamos sin ellos
      console.error("Error fetching reference prices:", err);
    }

    const referenceSection = buildReferenceSection(referencePrices);

    const systemInstruction = `Eres un experto presupuestador de obras y reformas en España. Tu trabajo es generar presupuestos con precios de COSTE realistas del mercado español actual (2025-2026).

REGLA FUNDAMENTAL:
- Genera partidas SOLO para los trabajos que el usuario describe explícitamente. NO inventes ni añadas trabajos que no se hayan mencionado.
- Si el usuario dice "cambiar grifería", genera SOLO la partida de grifería, no inventes fontanería completa, tuberías, ni llaves de paso.
- Si el usuario dice "alicatar paredes", genera SOLO alicatado de paredes, no añadas suelo, techo ni pintura por tu cuenta.
- Cada partida debe corresponder directamente a algo que el usuario ha descrito.

REGLAS DE FORMATO:
- Devuelve el "precio_coste" de cada partida (coste real sin margen de beneficio)
- Los precios de coste deben ser realistas para el mercado español
- Agrupa las partidas por categorías lógicas (Demolición, Albañilería, Fontanería, Electricidad, Carpintería, Pintura, etc.)
- Usa unidades estándar: m² (metro cuadrado), ml (metro lineal), ud (unidad), pa (partida alzada), h (hora)
- El subtotal de cada partida = cantidad × precio_coste
- Calcula el subtotal general, IVA al 21%, y total (basado en precio_coste, sin margen)
- Los precios deben incluir materiales y mano de obra en cada partida
- Si se incluyen fotos de las zonas, analízalas para ajustar cantidades y precios, pero NO añadas trabajos extra que el usuario no haya pedido
${referenceSection}
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "partidas": [
    {
      "categoria": "Categoría",
      "descripcion": "Descripción detallada del trabajo",
      "unidad": "m²",
      "cantidad": 10,
      "precio_coste": 25.00,
      "subtotal": 250.00
    }
  ],
  "subtotal": 1000.00,
  "iva": 210.00,
  "total": 1210.00
}`;

    let userMessage = `Genera un presupuesto detallado para el siguiente trabajo:\n\n`;

    if (project) {
      userMessage += `Obra: ${project.name}\n`;
      if (project.address) {
        userMessage += `Dirección: ${project.address}\n`;
      }
    }

    if (client_name) {
      userMessage += `Cliente: ${client_name}\n`;
    }

    if (tipo_obra) {
      userMessage += `Tipo de obra: ${tipo_obra}\n`;
    }

    userMessage += `\nDescripción del trabajo:\n${descripcion}\n\nIMPORTANTE: Genera partidas ÚNICAMENTE para lo que se describe arriba. No añadas trabajos extra que no estén mencionados. Precios de COSTE realistas del mercado español. Responde SOLO con el JSON.`;

    // Build user message parts: text + optional photos
    const userParts: Record<string, unknown>[] = [{ text: userMessage }];

    if (photos && photos.length > 0) {
      // Group photos by zone for context
      const zoneGroups = new Map<string, typeof photos>();
      for (const photo of photos) {
        const existing = zoneGroups.get(photo.zoneName) ?? [];
        existing.push(photo);
        zoneGroups.set(photo.zoneName, existing);
      }

      for (const [zoneName, zonePhotos] of zoneGroups) {
        userParts.push({ text: `\nFotos de la zona "${zoneName}":` });
        for (const photo of zonePhotos) {
          userParts.push({
            inlineData: {
              mimeType: photo.mimeType,
              data: photo.base64,
            },
          });
        }
      }
    }

    // Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: userParts,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      let userError = "Error al generar el presupuesto. Inténtalo de nuevo.";
      if (response.status === 400) {
        userError = "Error en la solicitud. Verifica la descripción e inténtalo de nuevo.";
      } else if (response.status === 403) {
        userError = "Servicio de IA no disponible. Contacta al administrador.";
      } else if (response.status === 429) {
        userError = "Has alcanzado el límite de generaciones. Espera unos minutos e inténtalo de nuevo.";
      } else if (response.status === 503) {
        userError = "El servicio está temporalmente sobrecargado. Inténtalo en unos minutos.";
      }

      return NextResponse.json(
        { error: userError },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const textContent = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("Gemini returned no content:", JSON.stringify(aiResult));
      return NextResponse.json(
        { error: "La IA no devolvió contenido válido." },
        { status: 502 }
      );
    }

    // Extract JSON from response with multiple strategies
    let parsed: AIResponse | null = null;

    // Strategy 1: direct parse
    try {
      parsed = JSON.parse(textContent.trim());
    } catch {
      // Strategy 2: extract from markdown code blocks
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch { /* continue */ }
      }

      // Strategy 3: find first { and last }
      if (!parsed) {
        const start = textContent.indexOf("{");
        const end = textContent.lastIndexOf("}");
        if (start !== -1 && end > start) {
          try {
            parsed = JSON.parse(textContent.slice(start, end + 1));
          } catch { /* continue */ }
        }
      }
    }

    if (!parsed || !Array.isArray(parsed.partidas)) {
      console.error("Failed to parse AI response:", textContent.slice(0, 500));
      return NextResponse.json(
        { error: "No se pudo interpretar la respuesta de la IA. Inténtalo de nuevo." },
        { status: 502 }
      );
    }

    // Apply margin and recalculate totals
    const margen = DEFAULT_MARGIN;
    const partidas: Partida[] = parsed.partidas.map((p, index) => {
      const precioCoste = roundCurrency(p.precio_coste);
      const precioUnitario = computeSellingPrice(precioCoste, margen);
      const subtotal = roundCurrency(p.cantidad * precioUnitario);

      return {
        categoria: p.categoria,
        descripcion: p.descripcion,
        unidad: p.unidad,
        cantidad: p.cantidad,
        precio_coste: precioCoste,
        margen,
        precio_unitario: precioUnitario,
        subtotal,
        orden: index,
      };
    });

    const subtotal = roundCurrency(partidas.reduce((sum, p) => sum + p.subtotal, 0));
    const iva = roundCurrency(subtotal * 0.21);
    const total = roundCurrency(subtotal + iva);

    return NextResponse.json({
      partidas,
      subtotal,
      iva,
      total,
      margen_global: margen,
    });
  } catch (error) {
    console.error("Generate estimate error:", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "La generaci\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
