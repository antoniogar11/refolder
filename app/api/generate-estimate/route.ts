import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

type Partida = {
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

type AIResponse = {
  partidas: Partida[];
  subtotal: number;
  iva: number;
  total: number;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key de IA no configurada. Contacta al administrador." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { project_id, descripcion, tipo_obra } = body;

    if (!project_id || !descripcion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: project_id y descripcion" },
        { status: 400 }
      );
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, address")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 });
    }

    const systemPrompt = `Eres un experto presupuestador de obras y reformas en España. Tu trabajo es generar presupuestos detallados y profesionales con precios realistas del mercado español actual (2024-2025).

REGLAS:
- Los precios deben ser realistas para el mercado español
- Incluye todas las partidas necesarias para el trabajo descrito
- Agrupa las partidas por categorías lógicas (Demolición, Albañilería, Fontanería, Electricidad, Carpintería, Pintura, etc.)
- Usa unidades estándar: m² (metro cuadrado), ml (metro lineal), ud (unidad), pa (partida alzada), h (hora)
- El subtotal de cada partida = cantidad × precio_unitario
- Calcula el subtotal general, IVA al 21%, y total
- Sé exhaustivo: incluye preparación, materiales, mano de obra, limpieza final

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "partidas": [
    {
      "categoria": "Categoría",
      "descripcion": "Descripción detallada del trabajo",
      "unidad": "m²",
      "cantidad": 10,
      "precio_unitario": 25.00,
      "subtotal": 250.00
    }
  ],
  "subtotal": 1000.00,
  "iva": 210.00,
  "total": 1210.00
}`;

    const userMessage = `Genera un presupuesto detallado para el siguiente trabajo:

Obra: ${project.name}
${project.address ? `Dirección: ${project.address}` : ""}
${tipo_obra ? `Tipo de obra: ${tipo_obra}` : ""}

Descripción del trabajo:
${descripcion}

Genera todas las partidas necesarias con precios realistas del mercado español.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Error al generar el presupuesto con IA. Inténtalo de nuevo." },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const textContent = aiResult.content?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: "La IA no devolvió contenido válido." },
        { status: 502 }
      );
    }

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let parsed: AIResponse;
    try {
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI response:", textContent);
      return NextResponse.json(
        { error: "No se pudo interpretar la respuesta de la IA. Inténtalo de nuevo." },
        { status: 502 }
      );
    }

    // Validate and recalculate totals
    const partidas = parsed.partidas.map((p, index) => ({
      ...p,
      subtotal: Math.round(p.cantidad * p.precio_unitario * 100) / 100,
      orden: index,
    }));

    const subtotal = Math.round(partidas.reduce((sum, p) => sum + p.subtotal, 0) * 100) / 100;
    const iva = Math.round(subtotal * 0.21 * 100) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;

    return NextResponse.json({
      partidas,
      subtotal,
      iva,
      total,
    });
  } catch (error) {
    console.error("Generate estimate error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
