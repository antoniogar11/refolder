"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FinanzasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en finanzas:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Error al cargar finanzas
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {error.message || "No se pudieron cargar los datos financieros. Por favor, inténtalo de nuevo."}
          </p>
          <Button onClick={reset}>Intentar de nuevo</Button>
        </CardContent>
      </Card>
    </div>
  );
}
