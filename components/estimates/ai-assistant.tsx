"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CompleteEstimateResult = {
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
};

type AIAssistantProps = {
  onDescriptionGenerated?: (description: string) => void;
  onPriceGenerated?: (price: number) => void;
  onItemsGenerated?: (items: string[]) => void;
  onCompleteEstimateGenerated?: (result: CompleteEstimateResult) => void;
  context?: string;
  mode?: "simple" | "complete";
};

export function AIAssistant({
  onDescriptionGenerated,
  onPriceGenerated,
  onItemsGenerated,
  onCompleteEstimateGenerated,
  context,
  mode = "simple",
}: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async (type: "description" | "price" | "items" | "complete_estimate") => {
    if (!input.trim()) {
      setError("Por favor, escribe algo primero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/estimate/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          input,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar sugerencia");
      }

      const data = await response.json();

      if (type === "description" && onDescriptionGenerated) {
        onDescriptionGenerated(data.result);
      } else if (type === "price" && onPriceGenerated) {
        onPriceGenerated(data.result);
      } else if (type === "items" && onItemsGenerated) {
        onItemsGenerated(data.result);
      } else if (type === "complete_estimate" && onCompleteEstimateGenerated) {
        onCompleteEstimateGenerated(data.result);
      }

      setInput("");
    } catch (err) {
      setError("Error al generar sugerencia. Verifica que GEMINI_API_KEY esté configurada.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h4 className="font-semibold text-gray-900 dark:text-white">Asistente de IA</h4>
      </div>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe lo que necesitas (ej: 'instalación eléctrica completa', 'reforma de baño')..."
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        />

        <div className="flex flex-wrap gap-2">
          {mode === "complete" && onCompleteEstimateGenerated ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleSuggest("complete_estimate")}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Generando..." : "✨ Generar Presupuesto Completo"}
            </Button>
          ) : (
            <>
              {onDescriptionGenerated && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggest("description")}
                  disabled={loading || !input.trim()}
                >
                  {loading ? "..." : "📝 Generar Descripción"}
                </Button>
              )}

              {onPriceGenerated && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggest("price")}
                  disabled={loading || !input.trim()}
                >
                  {loading ? "..." : "💰 Sugerir Precio"}
                </Button>
              )}

              {onItemsGenerated && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggest("items")}
                  disabled={loading || !input.trim()}
                >
                  {loading ? "..." : "📋 Generar Conceptos"}
                </Button>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {mode === "complete" && onCompleteEstimateGenerated && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            El asistente generará automáticamente la descripción, conceptos, cantidades y precios del presupuesto.
          </p>
        )}
        {mode === "simple" && !onDescriptionGenerated && !onPriceGenerated && !onItemsGenerated && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            El asistente de IA puede generar descripciones, sugerir precios o crear listas de conceptos.
          </p>
        )}
      </div>
    </div>
  );
}

