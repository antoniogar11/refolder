import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type EstimateData = {
  estimateName: string;
  estimateNumber: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientAddress: string | null;
  clientTaxId: string | null;
  projectName: string;
  projectAddress: string | null;
  items: {
    categoria: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
};

export function generateEstimatePDF(data: EstimateData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header - Company info
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("Refolder", margin, 30);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Gestión de Obras y Reformas", margin, 37);

  // Estimate number and date - right aligned
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text(`PRESUPUESTO`, pageWidth - margin, 25, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº: ${data.estimateNumber}`, pageWidth - margin, 32, {
    align: "right",
  });
  doc.text(`Fecha: ${data.date}`, pageWidth - margin, 38, { align: "right" });
  doc.text(`Válido hasta: ${data.validUntil}`, pageWidth - margin, 44, {
    align: "right",
  });

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 50, pageWidth - margin, 50);

  // Client info box
  let yPos = 58;
  doc.setFillColor(248, 250, 252); // gray-50
  doc.roundedRect(
    margin,
    yPos - 3,
    (pageWidth - 2 * margin) / 2 - 5,
    35,
    2,
    2,
    "F"
  );

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("CLIENTE", margin + 5, yPos + 3);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.clientName, margin + 5, yPos + 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (data.clientAddress) {
    doc.text(data.clientAddress, margin + 5, yPos + 18);
  }
  if (data.clientTaxId) {
    doc.text(`CIF/NIF: ${data.clientTaxId}`, margin + 5, yPos + 25);
  }

  // Project info box
  const rightBoxX = margin + (pageWidth - 2 * margin) / 2 + 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(
    rightBoxX,
    yPos - 3,
    (pageWidth - 2 * margin) / 2 - 5,
    35,
    2,
    2,
    "F"
  );

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("OBRA", rightBoxX + 5, yPos + 3);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.projectName, rightBoxX + 5, yPos + 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (data.projectAddress) {
    doc.text(data.projectAddress, rightBoxX + 5, yPos + 18);
  }

  // Estimate name
  yPos = 100;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.estimateName, margin, yPos);

  // Items table
  yPos += 8;

  const tableData = data.items.map((item) => [
    item.categoria,
    item.descripcion,
    item.unidad,
    item.cantidad.toFixed(2),
    `${item.precio_unitario.toFixed(2)} €`,
    `${item.subtotal.toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Categoría", "Descripción", "Ud.", "Cant.", "P. Unit.", "Subtotal"]],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 25, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Totals
  const finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  const totalsX = pageWidth - margin - 60;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", totalsX, finalY);
  doc.setTextColor(30, 30, 30);
  doc.text(`${data.subtotal.toFixed(2)} €`, pageWidth - margin, finalY, {
    align: "right",
  });

  doc.setTextColor(100, 100, 100);
  doc.text("IVA (21%):", totalsX, finalY + 7);
  doc.setTextColor(30, 30, 30);
  doc.text(`${data.iva.toFixed(2)} €`, pageWidth - margin, finalY + 7, {
    align: "right",
  });

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, finalY + 11, pageWidth - margin, finalY + 11);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("TOTAL:", totalsX, finalY + 19);
  doc.text(`${data.total.toFixed(2)} €`, pageWidth - margin, finalY + 19, {
    align: "right",
  });

  // Footer with conditions
  const footerY = finalY + 35;
  if (footerY < 260) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text("CONDICIONES:", margin, footerY + 6);
    doc.text(
      "• Presupuesto válido por 30 días desde la fecha de emisión. • Los precios incluyen materiales y mano de obra salvo indicación contraria.",
      margin,
      footerY + 11
    );
    doc.text(
      "• Plazo de ejecución a convenir. • No incluye trabajos no especificados en las partidas anteriores.",
      margin,
      footerY + 16
    );
  }

  // Page footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado con Refolder · Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Download
  const filename = `presupuesto-${data.estimateNumber.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  doc.save(filename);
}
