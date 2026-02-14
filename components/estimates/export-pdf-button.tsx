"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generateEstimatePDF } from "@/lib/pdf/generate-estimate-pdf";
import type { Estimate, EstimateItem } from "@/types";

type ExportPDFButtonProps = {
  estimate: Estimate;
  items: EstimateItem[];
};

export function ExportPDFButton({ estimate, items }: ExportPDFButtonProps) {
  function handleExport() {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = Math.round(subtotal * 0.21 * 100) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;

    const estimateDate = new Date(estimate.created_at);
    const validUntilDate = estimate.valid_until
      ? new Date(estimate.valid_until)
      : new Date(estimateDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const estimateNumber = `PRE-${estimateDate.getFullYear()}${String(estimateDate.getMonth() + 1).padStart(2, "0")}${String(estimateDate.getDate()).padStart(2, "0")}-${estimate.id.slice(0, 4).toUpperCase()}`;

    generateEstimatePDF({
      estimateName: estimate.name,
      estimateNumber,
      date: estimateDate.toLocaleDateString("es-ES"),
      validUntil: validUntilDate.toLocaleDateString("es-ES"),
      clientName: estimate.project?.client?.name || "Cliente sin especificar",
      clientAddress: null,
      clientTaxId: null,
      projectName: estimate.project?.name || "Obra sin especificar",
      projectAddress: null,
      items: items.map((item) => ({
        categoria: item.categoria,
        descripcion: item.descripcion,
        unidad: item.unidad,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      })),
      subtotal,
      iva,
      total,
    });
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileDown className="mr-2 h-4 w-4 text-amber-600" />
      Exportar PDF
    </Button>
  );
}
