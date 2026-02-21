import { computeEstimateTotals } from "@/lib/utils/estimate-totals";
import { formatCurrency } from "@/lib/utils/format";

type EstimateTotalsProps = {
  items: { cantidad: number; precio_unitario: number; iva_porcentaje?: number | null }[];
  className?: string;
};

export function EstimateTotals({ items, className = "" }: EstimateTotalsProps) {
  const { subtotal, ivaGroups, total } = computeEstimateTotals(items);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>Total ejecución material</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {ivaGroups.length === 1 ? (
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            IVA {ivaGroups[0].ivaPorcentaje}%
            {ivaGroups[0].ivaPorcentaje === 10 && " (Reducido)"}
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(ivaGroups[0].cuota)}
          </span>
        </div>
      ) : ivaGroups.length > 1 ? (
        <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-700 text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="px-3 py-1.5 text-left font-medium">Impuesto</th>
                <th className="px-3 py-1.5 text-right font-medium">Base imponible</th>
                <th className="px-3 py-1.5 text-right font-medium">Cuota</th>
              </tr>
            </thead>
            <tbody>
              {ivaGroups.map((group) => (
                <tr key={group.ivaPorcentaje} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">
                    IVA {group.ivaPorcentaje}%
                    {group.ivaPorcentaje === 10 && " (Reducido)"}
                    {group.ivaPorcentaje === 4 && " (Superreducido)"}
                    {group.ivaPorcentaje === 0 && " (Exento)"}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-900 dark:text-white">
                    {formatCurrency(group.baseImponible)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900 dark:text-white">
                    {formatCurrency(group.cuota)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="border-t border-slate-300 dark:border-slate-600 pt-2" />
      <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
