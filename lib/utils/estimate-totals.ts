import { roundCurrency } from "@/lib/utils";

export type IvaGroup = {
  ivaPorcentaje: number;
  baseImponible: number;
  cuota: number;
};

export type EstimateTotalsResult = {
  subtotal: number;
  ivaGroups: IvaGroup[];
  totalIva: number;
  total: number;
};

/**
 * Calcula los totales de un presupuesto con desglose de IVA por tipo.
 * Agrupa las partidas por iva_porcentaje y calcula base imponible y cuota de cada grupo.
 */
export function computeEstimateTotals(
  items: { cantidad: number; precio_unitario: number; iva_porcentaje?: number | null }[],
): EstimateTotalsResult {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + roundCurrency(item.cantidad * item.precio_unitario), 0),
  );

  // Agrupar por tipo de IVA (default 21% para items sin iva_porcentaje)
  const groupMap = new Map<number, number>();
  for (const item of items) {
    const iva = item.iva_porcentaje ?? 21;
    const lineSubtotal = roundCurrency(item.cantidad * item.precio_unitario);
    const current = groupMap.get(iva) ?? 0;
    groupMap.set(iva, roundCurrency(current + lineSubtotal));
  }

  // Ordenar descendente (21% primero, luego 10%, 4%, 0%)
  const ivaGroups: IvaGroup[] = Array.from(groupMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([ivaPorcentaje, baseImponible]) => ({
      ivaPorcentaje,
      baseImponible,
      cuota: roundCurrency(baseImponible * (ivaPorcentaje / 100)),
    }));

  const totalIva = roundCurrency(ivaGroups.reduce((sum, g) => sum + g.cuota, 0));
  const total = roundCurrency(subtotal + totalIva);

  return { subtotal, ivaGroups, totalIva, total };
}
