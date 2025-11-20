import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    const { type, input, context } = await request.json();

    let prompt = "";

    switch (type) {
      case "description":
        // Generar descripción profesional de un concepto de presupuesto
        prompt = `Eres un experto en construcción y reformas. Genera una descripción profesional y técnica para un concepto de presupuesto basándote en el siguiente texto:

"${input}"

${context ? `Contexto: ${context}` : ""}

Genera SOLO la descripción, sin explicaciones adicionales. Debe ser clara, profesional y específica para el sector de la construcción. Máximo 100 palabras.`;
        break;

      case "price":
        // Sugerir precio basado en descripción
        prompt = `Eres un experto en construcción y reformas en España. Basándote en la siguiente descripción de un concepto de presupuesto, sugiere un precio unitario aproximado en euros.

Descripción: "${input}"

Responde SOLO con un número (el precio en euros), sin símbolos, sin texto adicional, solo el número. Si no puedes estimar, responde "0".`;
        break;

      case "full_description":
        // Generar descripción completa del presupuesto
        prompt = `Eres un experto en construcción y reformas. Genera una descripción profesional para un presupuesto basándote en:

Título: "${input}"
${context ? `Contexto adicional: ${context}` : ""}

Genera una descripción clara y profesional que explique el alcance del presupuesto. Máximo 200 palabras.`;
        break;

      case "items":
        // Generar lista de conceptos basado en descripción
        prompt = `Eres un experto en construcción y reformas en España. Basándote en la siguiente descripción de un presupuesto, genera una lista de conceptos/líneas que deberían incluirse en el presupuesto.

Descripción: "${input}"

Responde SOLO con una lista numerada de conceptos, uno por línea. Cada concepto debe ser específico y profesional. Máximo 15 conceptos.`;
        break;

      case "complete_estimate":
        // Generar presupuesto completo: descripción + items con precios y cantidades
        prompt = `Eres un experto en construcción y reformas en España. Basándote en la siguiente descripción de un presupuesto, genera:

1. Una descripción profesional del presupuesto (máximo 150 palabras)
2. Una lista completa de conceptos/líneas con sus cantidades y precios unitarios en euros

Descripción del trabajo: "${input}"
${context ? `Contexto adicional: ${context}` : ""}

IMPORTANTE: Responde en el siguiente formato JSON exacto (sin texto adicional antes o después):

{
  "description": "Descripción profesional del presupuesto aquí",
  "items": [
    {
      "description": "Descripción del concepto 1",
      "quantity": 1,
      "unit_price": 250.00
    },
    {
      "description": "Descripción del concepto 2",
      "quantity": 5,
      "unit_price": 45.50
    }
  ]
}

Cada concepto debe tener:
- description: descripción profesional y específica del concepto
- quantity: cantidad estimada (número realista)
- unit_price: precio unitario en euros (precio de mercado en España, sin símbolo €)

Genera entre 5 y 15 conceptos dependiendo de la complejidad del trabajo. Los precios deben ser realistas para el mercado español de construcción.`;
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de sugerencia no válido" },
          { status: 400 }
        );
    }

    // Usar la API REST de Gemini directamente
    // Usar gemini-2.5-flash que está disponible en v1beta
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!text) {
      throw new Error("No se recibió respuesta del modelo");
    }

    // Para el tipo "price", extraer solo el número
    if (type === "price") {
      const priceMatch = text.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/,/g, ""));
        return NextResponse.json({ result: isNaN(price) ? 0 : price });
      }
      return NextResponse.json({ result: 0 });
    }

    // Para el tipo "items", parsear la lista
    if (type === "items") {
      const items = text
        .split(/\n+/)
        .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line: string) => line.length > 0);
      return NextResponse.json({ result: items });
    }

    // Para el tipo "complete_estimate", parsear el JSON
    if (type === "complete_estimate") {
      try {
        // Intentar extraer JSON del texto (puede haber markdown code blocks)
        let jsonText = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        const parsed = JSON.parse(jsonText);
        return NextResponse.json({ result: parsed });
      } catch (parseError) {
        console.error("Error parseando respuesta completa:", parseError);
        // Si falla el parsing, intentar extraer información manualmente
        return NextResponse.json({ 
          error: "Error al parsear la respuesta de IA",
          details: "La IA no devolvió el formato JSON esperado"
        }, { status: 500 });
      }
    }

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Error en sugerencia de IA:", error);
    const errorMessage = error?.message || "Error desconocido";
    const errorDetails = error?.cause || error?.stack;
    
    return NextResponse.json(
      { 
        error: "Error al generar sugerencia",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" && { debug: errorDetails })
      },
      { status: 500 }
    );
  }
}

