import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key de IA no configurada. Añade GEMINI_API_KEY en las variables de entorno de Vercel." },
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

    const systemInstruction = `Eres un experto presupuestador de obras y reformas en España. Tu trabajo es generar presupuestos detallados y profesionales con precios realistas del mercado español actual (2025-2026).

REGLAS:
- Los precios deben ser realistas para el mercado español
- Incluye todas las partidas necesarias para el trabajo descrito
- Agrupa las partidas por categorías lógicas (Demolición, Albañilería, Fontanería, Electricidad, Carpintería, Pintura, etc.)
- Usa unidades estándar: m² (metro cuadrado), ml (metro lineal), ud (unidad), pa (partida alzada), h (hora)
- El subtotal de cada partida = cantidad × precio_unitario
- Calcula el subtotal general, IVA al 21%, y total
- Sé exhaustivo: incluye preparación, materiales, mano de obra, limpieza final

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
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

    userMessage += `\nDescripción del trabajo:\n${descripcion}\n\nGenera todas las partidas necesarias con precios realistas del mercado español. Responde SOLO con el JSON, sin texto adicional.`;

    // Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      let userError = "Error al generar el presupuesto con IA. Inténtalo de nuevo.";
      if (response.status === 400) {
        userError = "Error en la solicitud a la IA. Verifica la descripción e inténtalo de nuevo.";
      } else if (response.status === 403) {
        userError = "La API key de Gemini no es válida o no tiene permisos. Verifica GEMINI_API_KEY en las variables de entorno.";
      } else if (response.status === 429) {
        userError = "Se superó el límite de uso de la IA. Espera unos minutos e inténtalo de nuevo.";
      } else if (response.status === 503) {
        userError = "El servicio de IA está temporalmente sobrecargado. Inténtalo de nuevo en unos minutos.";
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
