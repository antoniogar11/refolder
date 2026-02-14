"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Algo salió mal
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
        {error.message || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."}
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  );
}
