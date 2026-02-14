import { cn } from "@/lib/utils";

type CostComparisonProps = {
  budgeted: number;
  spent: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function CostComparison({ budgeted, spent }: CostComparisonProps) {
  const difference = budgeted - spent;
  const percentage = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
  const isOver = spent > budgeted && budgeted > 0;
  const barWidth = budgeted > 0 ? Math.min(percentage, 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Presupuestado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(budgeted)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gastado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(spent)}</p>
        </div>
        <div className={cn(
          "rounded-lg border p-4",
          isOver ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
        )}>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {isOver ? "Exceso" : "Margen"}
          </p>
          <p className={cn(
            "mt-1 text-2xl font-bold",
            isOver ? "text-rose-600" : "text-emerald-600"
          )}>
            {isOver ? `-${formatCurrency(Math.abs(difference))}` : formatCurrency(difference)}
          </p>
        </div>
      </div>

      {budgeted > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progreso de gasto</span>
            <span className={cn(
              "font-medium",
              percentage > 100 ? "text-rose-600" : percentage > 80 ? "text-amber-600" : "text-emerald-600"
            )}>
              {percentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentage > 100 ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          {isOver && (
            <p className="text-sm font-medium text-rose-600">
              Te has pasado del presupuesto en {formatCurrency(Math.abs(difference))}
            </p>
          )}
          {!isOver && budgeted > 0 && (
            <p className="text-sm font-medium text-emerald-600">
              Te quedan {formatCurrency(difference)} de margen
            </p>
          )}
        </div>
      )}

      {budgeted === 0 && (
        <p className="text-sm text-slate-500 italic">
          Vincula un presupuesto al proyecto para ver la comparación de costes.
        </p>
      )}
    </div>
  );
}
