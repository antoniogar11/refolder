import type { EstimateData } from "@/lib/pdf/generate-estimate-pdf";
import type { Estimate, EstimateItem, Company } from "@/types";
import { computeEstimateTotals } from "@/lib/utils/estimate-totals";
import { roundCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

/**
 * Construye el objeto EstimateData necesario para generar el PDF
 * a partir de los objetos de la base de datos.
 * Reutilizable tanto en client (ExportPDFButton) como en server (email action).
 */
export function buildEstimatePDFData(
  estimate: Estimate,
  items: EstimateItem[],
  company: Company | null,
): EstimateData {
  const totals = computeEstimateTotals(items);
  const { subtotal, ivaGroups, total } = totals;

  const estimateDate = new Date(estimate.created_at);
  const validUntilDate = estimate.valid_until
    ? new Date(estimate.valid_until)
    : new Date(estimateDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const estimateNumber = `PRE-${estimateDate.getFullYear()}${String(estimateDate.getMonth() + 1).padStart(2, "0")}${String(estimateDate.getDate()).padStart(2, "0")}-${estimate.id.slice(0, 4).toUpperCase()}`;

  const client = estimate.client || estimate.project?.client;

  return {
    estimateName: estimate.name,
    estimateNumber,
    date: formatDate(estimateDate.toISOString(), { style: "medium" }),
    validUntil: formatDate(validUntilDate.toISOString(), { style: "medium" }),
    companyName: company?.name || "Refolder",
    companySubtitle: company?.subtitle || null,
    companyTaxId: company?.tax_id || null,
    companyAddress: company?.address || null,
    companyCity: company?.city || null,
    companyProvince: company?.province || null,
    companyPostalCode: company?.postal_code || null,
    companyPhone: company?.phone || null,
    companyEmail: company?.email || null,
    clientName: client?.name || "Cliente sin especificar",
    clientAddress: client?.address || null,
    clientCity: client?.city || null,
    clientProvince: client?.province || null,
    clientPostalCode: client?.postal_code || null,
    clientTaxId: client?.tax_id || null,
    projectName: estimate.project?.name || "Sin obra asociada",
    projectAddress: estimate.project?.address || null,
    items: items.map((item) => ({
      categoria: item.categoria,
      descripcion: item.descripcion,
      unidad: item.unidad,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: roundCurrency(item.cantidad * item.precio_unitario),
      iva_porcentaje: item.iva_porcentaje ?? 21,
    })),
    subtotal,
    ivaGroups,
    total,
    notes: estimate.notes || null,
  };
}
