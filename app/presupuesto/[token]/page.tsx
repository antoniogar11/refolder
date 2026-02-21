import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedEstimate } from "@/lib/data/public-estimates";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { roundCurrency } from "@/lib/utils";
import { computeEstimateTotals } from "@/lib/utils/estimate-totals";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  try {
    const data = await getSharedEstimate(token);
    if (!data) {
      return { title: "Presupuesto no encontrado" };
    }

    const companyName = data.company?.name || "Refolder";
    return {
      title: `${data.estimate.name} - ${companyName}`,
      description: `Presupuesto de ${companyName}`,
    };
  } catch {
    return { title: "Presupuesto" };
  }
}

export default async function SharedEstimatePage({ params }: Props) {
  const { token } = await params;

  let data;
  try {
    data = await getSharedEstimate(token);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Error del servidor</h1>
          <p className="mt-2 text-slate-600">
            No se ha podido cargar el presupuesto. Inténtalo más tarde.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { estimate, items, company } = data;
  const client = estimate.client || estimate.project?.client;

  // Calculate totals from items (per-item IVA)
  const { subtotal, ivaGroups, totalIva, total } = computeEstimateTotals(items);

  // Group items by category
  const categories = new Map<string, typeof items>();
  for (const item of items) {
    const cat = item.categoria || "General";
    const existing = categories.get(cat) ?? [];
    existing.push(item);
    categories.set(cat, existing);
  }

  const estimateDate = new Date(estimate.created_at);
  const validUntilDate = estimate.valid_until
    ? new Date(estimate.valid_until)
    : new Date(estimateDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{estimate.name}</h1>
              {estimate.project?.name && (
                <p className="mt-1 text-blue-200">
                  {estimate.project.name}
                  {estimate.project.address && ` · ${estimate.project.address}`}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-blue-200">
              <p>Fecha: {formatDate(estimate.created_at, { style: "medium" })}</p>
              <p>
                Válido hasta:{" "}
                {formatDate(validUntilDate.toISOString(), { style: "medium" })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Company & Client Info */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Company */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Datos del profesional
            </p>
            <p className="font-semibold text-slate-900">
              {company?.name || "Empresa"}
            </p>
            {company?.tax_id && (
              <p className="text-sm text-slate-600">CIF/NIF: {company.tax_id}</p>
            )}
            {(company?.address || company?.city) && (
              <p className="text-sm text-slate-600">
                {[company.address, company.postal_code, company.city, company.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {(company?.phone || company?.email) && (
              <p className="text-sm text-slate-600">
                {[company.phone, company.email].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {/* Client */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Datos del cliente
            </p>
            <p className="font-semibold text-slate-900">
              {client?.name || "Cliente sin especificar"}
            </p>
            {client?.tax_id && (
              <p className="text-sm text-slate-600">CIF/NIF: {client.tax_id}</p>
            )}
            {(client?.address || client?.city) && (
              <p className="text-sm text-slate-600">
                {[client.address, client.postal_code, client.city, client.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Items by Category */}
        <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {Array.from(categories.entries()).map(([category, categoryItems], catIndex) => {
            const categorySubtotal = categoryItems.reduce(
              (sum, item) => sum + roundCurrency(item.cantidad * item.precio_unitario),
              0,
            );
            return (
              <div key={category}>
                {/* Category header */}
                <div className="bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white">
                  {catIndex + 1}. {category.toUpperCase()}
                </div>

                {/* Mobile: lista de partidas */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {categoryItems.map((item, itemIdx) => {
                    const itemSubtotal = roundCurrency(
                      item.cantidad * item.precio_unitario,
                    );
                    return (
                      <div key={item.id} className="px-4 py-3">
                        <p className="text-sm text-slate-700">
                          <span className="mr-1.5 text-xs text-slate-400">
                            {catIndex + 1}.{itemIdx + 1}
                          </span>
                          {item.descripcion}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {item.cantidad} x {formatCurrency(item.precio_unitario)}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(itemSubtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Total {category}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(categorySubtotal)}
                    </span>
                  </div>
                </div>

                {/* Desktop: tabla */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-xs text-slate-500">
                        <th className="px-4 py-2 text-left font-medium">Descripción</th>
                        <th className="px-3 py-2 text-center font-medium">Ud.</th>
                        <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                        <th className="px-3 py-2 text-right font-medium">Precio Ud.</th>
                        <th className="px-4 py-2 text-right font-medium">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryItems.map((item) => {
                        const itemSubtotal = roundCurrency(
                          item.cantidad * item.precio_unitario,
                        );
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-2.5 text-slate-700">
                              {item.descripcion}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-center text-slate-500">
                              {item.unidad}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">
                              {item.cantidad.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">
                              {formatCurrency(item.precio_unitario)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-slate-900">
                              {formatCurrency(itemSubtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50">
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right text-xs font-semibold text-slate-600"
                        >
                          Total {category}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-slate-900">
                          {formatCurrency(categorySubtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Total ejecución material</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {ivaGroups.length === 1 ? (
              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  IVA {ivaGroups[0].ivaPorcentaje}%
                  {ivaGroups[0].ivaPorcentaje === 10 && " (Reducido)"}
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(ivaGroups[0].cuota)}
                </span>
              </div>
            ) : (
              ivaGroups.map((g) => (
                <div key={g.ivaPorcentaje} className="flex justify-between text-sm text-slate-600">
                  <span>
                    IVA {g.ivaPorcentaje}%
                    {g.ivaPorcentaje === 10 && " (Reducido)"}
                    {g.ivaPorcentaje === 4 && " (Super.)"}
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(g.cuota)}
                  </span>
                </div>
              ))
            )}
            <div className="border-t border-slate-300 pt-2" />
            <div className="flex justify-between rounded-lg bg-[#1e3a5f] px-4 py-3 text-white">
              <span className="font-semibold">TOTAL PRESUPUESTO</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-[#1e3a5f]">NOTAS</h3>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>
              Presupuesto válido por 30 días desde la fecha de emisión.
            </li>
            <li>
              Los precios incluyen materiales y mano de obra salvo indicación
              contraria.
            </li>
            <li>
              No incluye trabajos no especificados en las partidas anteriores.
            </li>
            <li>
              Plazo de ejecución a convenir tras la aceptación del presupuesto.
            </li>
            {ivaGroups.some((g) => g.ivaPorcentaje === 10) && (
              <li>
                IVA reducido del 10% aplicado según Art. 91.Uno.2.10.º Ley
                37/1992.
              </li>
            )}
            {estimate.notes && <li>{estimate.notes}</li>}
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          <p>
            {company?.name || "Empresa"} · {formatDate(estimate.created_at, { style: "medium" })}
          </p>
          <p className="mt-1">
            Generado con{" "}
            <a
              href="https://refolder.es"
              className="text-amber-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Refolder
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
