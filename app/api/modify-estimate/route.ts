import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ratelimit } from "@/lib/rate-limit";
import { roundCurrency, computeSellingPrice } from "@/lib/utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type PartidaInput = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  margen: number;
  precio_unitario: number;
  subtotal: number;
  orden: number;
};

type AIPartida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_coste: number;
  subtotal: number;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { success } = await ratelimit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de generaciones por hora." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Servicio de IA no disponible." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { partidas, instruccion, margen_global } = body as {
      partidas: PartidaInput[];
      instruccion: string;
      margen_global: number;
    };

    if (!instruccion?.trim()) {
      return NextResponse.json({ error: "Escribe una instrucción." }, { status: 400 });
    }

    if (!partidas || partidas.length === 0) {
      return NextResponse.json({ error: "No hay partidas que modificar." }, { status: 400 });
    }

    const partidasResumen = partidas.map((p, i) => ({
      orden: i,
      categoria: p.categoria,
      descripcion: p.descripcion,
      unidad: p.unidad,
      cantidad: p.cantidad,
      precio_coste: p.precio_coste,
      subtotal: p.subtotal,
    }));

    const systemInstruction = `Eres un experto presupuestador de obras y reformas en España. El usuario tiene un presupuesto generado y quiere modificarlo.

REGLAS:
- Devuelve las partidas modificadas según la instrucción del usuario
- Mantén las partidas que no se ven afectadas por el cambio
- Si el usuario pide añadir algo, añade nuevas partidas con precios de coste realistas del mercado español
- Si el usuario pide eliminar algo, quítalo del listado
- Si el usuario pide cambiar precios o cantidades, ajústalos
- Devuelve el "precio_coste" (coste real sin margen)
- El subtotal de cada partida = cantidad × precio_coste

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "partidas": [
    {
      "categoria": "Categoría",
      "descripcion": "Descripción",
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

    const userMessage = `Presupuesto actual:\n${JSON.stringify(partidasResumen, null, 2)}\n\nInstrucción del usuario: ${instruccion}\n\nDevuelve el presupuesto completo modificado (todas las partidas, no solo las cambiadas). Responde SOLO con el JSON.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Error al modificar el presupuesto." },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const textContent = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: "La IA no devolvió contenido válido." },
        { status: 502 }
      );
    }

    let parsed: { partidas: AIPartida[] } | null = null;

    try {
      parsed = JSON.parse(textContent.trim());
    } catch {
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch { /* continue */ }
      }

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

    const margen = margen_global ?? 20;
    const newPartidas = parsed.partidas.map((p, index) => {
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

    const subtotal = roundCurrency(newPartidas.reduce((sum, p) => sum + p.subtotal, 0));
    const iva = roundCurrency(subtotal * 0.21);
    const total = roundCurrency(subtotal + iva);

    return NextResponse.json({
      partidas: newPartidas,
      subtotal,
      iva,
      total,
      margen_global: margen,
    });
  } catch (error) {
    console.error("Modify estimate error:", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "La modificaci\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo." },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
