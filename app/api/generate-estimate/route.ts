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
      console.error("ANTHROPIC_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key de IA no configurada. Añade ANTHROPIC_API_KEY en las variables de entorno de Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { project_id, descripcion, tipo_obra, client_name } = body;

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

    const systemPrompt = `Eres un experto presupuestador de obras y reformas en España. Tu trabajo es generar presupuestos detallados y profesionales con precios realistas del mercado español actual (2025-2026).

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

    userMessage += `\nDescripción del trabajo:\n${descripcion}\n\nGenera todas las partidas necesarias con precios realistas del mercado español.`;

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
      console.error("Anthropic API error:", response.status, errorText);

      let userError = "Error al generar el presupuesto con IA. Inténtalo de nuevo.";
      if (response.status === 401) {
        userError = "La API key de Anthropic no es válida. Verifica ANTHROPIC_API_KEY en las variables de entorno.";
      } else if (response.status === 429) {
        userError = "Se superó el límite de uso de la IA. Espera unos minutos e inténtalo de nuevo.";
      } else if (response.status === 529 || response.status === 503) {
        userError = "El servicio de IA está temporalmente sobrecargado. Inténtalo de nuevo en unos minutos.";
      }

      return NextResponse.json(
        { error: userError },
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
