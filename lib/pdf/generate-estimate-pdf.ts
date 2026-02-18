import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type EstimateData = {
  estimateName: string;
  estimateNumber: string;
  date: string;
  validUntil: string;
  // Datos de empresa
  companyName: string;
  companySubtitle: string | null;
  companyTaxId: string | null;
  companyAddress: string | null;
  companyCity: string | null;
  companyProvince: string | null;
  companyPostalCode: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  // Datos de cliente
  clientName: string;
  clientAddress: string | null;
  clientCity: string | null;
  clientProvince: string | null;
  clientPostalCode: string | null;
  clientTaxId: string | null;
  // Datos de obra/proyecto
  projectName: string;
  projectAddress: string | null;
  // Partidas
  items: {
    categoria: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  ivaPorcentaje: number;
  iva: number;
  total: number;
  notes: string | null;
};

// Colors
const DARK_BLUE: [number, number, number] = [30, 58, 95]; // #1e3a5f
const MEDIUM_BLUE: [number, number, number] = [44, 82, 130];
const LIGHT_BLUE_BG: [number, number, number] = [235, 241, 250];
const DARK_TEXT: [number, number, number] = [30, 30, 30];
const MEDIUM_TEXT: [number, number, number] = [80, 80, 80];
const LIGHT_TEXT: [number, number, number] = [130, 130, 130];
const WHITE: [number, number, number] = [255, 255, 255];

function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

type Chapter = {
  name: string;
  number: number;
  items: {
    code: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  subtotal: number;
};

function groupItemsByChapter(items: EstimateData["items"]): Chapter[] {
  const chapters: Chapter[] = [];
  const categoryMap = new Map<string, number>();

  for (const item of items) {
    const cat = item.categoria || "General";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, chapters.length + 1);
      chapters.push({ name: cat.toUpperCase(), number: chapters.length + 1, items: [], subtotal: 0 });
    }
    const chapterIndex = categoryMap.get(cat)! - 1;
    const chapter = chapters[chapterIndex];
    const itemNumber = chapter.items.length + 1;
    chapter.items.push({
      code: `${chapter.number}.${itemNumber}`,
      descripcion: item.descripcion,
      unidad: item.unidad,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: Math.round(item.cantidad * item.precio_unitario * 100) / 100,
    });
    chapter.subtotal = Math.round((chapter.subtotal + chapter.items[chapter.items.length - 1].subtotal) * 100) / 100;
  }

  return chapters;
}

export function generateEstimatePDF(data: EstimateData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // === HEADER: Blue banner with title ===
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(data.estimateName.toUpperCase(), margin, 18);

  // Subtitle with project/work info
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(200, 210, 230);
  const subtitleParts = [data.projectName !== "Sin obra asociada" ? data.projectName : null, data.projectAddress].filter(Boolean);
  if (subtitleParts.length > 0) {
    doc.text(subtitleParts.join(" · "), margin, 26);
  }

  // Estimate number in top-right
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text(`N.º ${data.estimateNumber}`, pageWidth - margin, 14, { align: "right" });

  // Client | Date | Validez line below banner
  const yBannerInfo = 34;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 230);
  const infoLine = [`Cliente: ${data.clientName}`, `Fecha: ${data.date}`, `Validez: 30 días`].join("  |  ");
  doc.text(infoLine, margin, yBannerInfo);

  let yPos = 46;

  // === COMPANY AND CLIENT INFO BOXES ===
  const boxWidth = (contentWidth - 8) / 2;

  // Company box
  doc.setFillColor(...LIGHT_BLUE_BG);
  doc.roundedRect(margin, yPos, boxWidth, 32, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MEDIUM_BLUE);
  doc.text("DATOS DEL PROFESIONAL", margin + 5, yPos + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_TEXT);
  doc.text(data.companyName, margin + 5, yPos + 13);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MEDIUM_TEXT);
  let companyLineY = yPos + 18;
  if (data.companyTaxId) {
    doc.text(`CIF/NIF: ${data.companyTaxId}`, margin + 5, companyLineY);
    companyLineY += 4;
  }
  const companyAddrParts = [data.companyAddress, data.companyPostalCode, data.companyCity, data.companyProvince].filter(Boolean);
  if (companyAddrParts.length > 0) {
    doc.text(companyAddrParts.join(", "), margin + 5, companyLineY, { maxWidth: boxWidth - 10 });
    companyLineY += 4;
  }
  const companyContactParts = [data.companyPhone, data.companyEmail].filter(Boolean);
  if (companyContactParts.length > 0) {
    doc.text(companyContactParts.join(" · "), margin + 5, companyLineY, { maxWidth: boxWidth - 10 });
  }

  // Client box
  const clientBoxX = margin + boxWidth + 8;
  doc.setFillColor(...LIGHT_BLUE_BG);
  doc.roundedRect(clientBoxX, yPos, boxWidth, 32, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MEDIUM_BLUE);
  doc.text("DATOS DEL CLIENTE", clientBoxX + 5, yPos + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_TEXT);
  doc.text(data.clientName, clientBoxX + 5, yPos + 13);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MEDIUM_TEXT);
  let clientLineY = yPos + 18;
  if (data.clientTaxId) {
    doc.text(`CIF/NIF: ${data.clientTaxId}`, clientBoxX + 5, clientLineY);
    clientLineY += 4;
  }
  const clientAddrParts = [data.clientAddress, data.clientPostalCode, data.clientCity, data.clientProvince].filter(Boolean);
  if (clientAddrParts.length > 0) {
    doc.text(clientAddrParts.join(", "), clientBoxX + 5, clientLineY, { maxWidth: boxWidth - 10 });
  }

  yPos += 38;

  // === CHAPTERS TABLE ===
  const chapters = groupItemsByChapter(data.items);

  // Build table rows with chapter headers and subtotals
  type CellDef = { content: string; colSpan?: number; styles?: Record<string, unknown> };
  const tableBody: (string | CellDef)[][] = [];

  for (const chapter of chapters) {
    // Chapter header row
    tableBody.push([
      {
        content: `CAPÍTULO ${chapter.number}: ${chapter.name}`,
        colSpan: 6,
        styles: {
          fillColor: DARK_BLUE,
          textColor: WHITE,
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        },
      },
    ]);

    // Chapter items
    for (const item of chapter.items) {
      tableBody.push([
        item.code,
        item.descripcion,
        item.unidad,
        item.cantidad.toFixed(2),
        formatCurrency(item.precio_unitario),
        formatCurrency(item.subtotal),
      ]);
    }

    // Chapter subtotal row
    tableBody.push([
      {
        content: `Total ${chapter.name}`,
        colSpan: 5,
        styles: {
          fontStyle: "bold",
          halign: "right" as const,
          fillColor: [245, 247, 250],
          fontSize: 8,
        },
      },
      {
        content: formatCurrency(chapter.subtotal),
        styles: {
          fontStyle: "bold",
          halign: "right" as const,
          fillColor: [245, 247, 250],
          fontSize: 8,
        },
      },
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [["Cód.", "Descripción", "Ud.", "Cantidad", "Precio Ud.", "Importe"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: {
      fillColor: MEDIUM_BLUE,
      textColor: WHITE,
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: DARK_TEXT,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 26, halign: "right" },
    },
    styles: {
      lineColor: [200, 210, 220],
      lineWidth: 0.3,
      overflow: "linebreak",
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
  });

  // === TOTALS SECTION ===
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = ((doc as any).lastAutoTable?.finalY ?? yPos + 40) + 8;

  // Check if we need a new page for totals
  if (finalY + 60 > pageHeight - 30) {
    doc.addPage();
    finalY = 20;
  }

  const totalsBoxX = pageWidth - margin - 80;
  const totalsBoxWidth = 80;

  // Subtotal (Ejecución Material)
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MEDIUM_TEXT);
  doc.text("TOTAL EJECUCIÓN MATERIAL", totalsBoxX, finalY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_TEXT);
  doc.text(formatCurrency(data.subtotal), totalsBoxX + totalsBoxWidth, finalY, { align: "right" });

  // IVA
  finalY += 7;
  const ivaLabel = data.ivaPorcentaje === 10 ? "IVA 10% (Reducido)" : `IVA ${data.ivaPorcentaje}%`;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MEDIUM_TEXT);
  doc.text(ivaLabel, totalsBoxX, finalY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_TEXT);
  doc.text(formatCurrency(data.iva), totalsBoxX + totalsBoxWidth, finalY, { align: "right" });

  // Total line
  finalY += 4;
  doc.setDrawColor(...DARK_BLUE);
  doc.setLineWidth(0.8);
  doc.line(totalsBoxX, finalY, totalsBoxX + totalsBoxWidth, finalY);

  // TOTAL PRESUPUESTO - highlighted
  finalY += 8;
  doc.setFillColor(...DARK_BLUE);
  doc.roundedRect(totalsBoxX - 5, finalY - 5, totalsBoxWidth + 10, 14, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("TOTAL PRESUPUESTO", totalsBoxX, finalY + 3);
  doc.text(formatCurrency(data.total), totalsBoxX + totalsBoxWidth, finalY + 3, { align: "right" });

  // === NOTES SECTION ===
  finalY += 20;

  if (finalY + 40 > pageHeight - 30) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_BLUE);
  doc.text("NOTAS:", margin, finalY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MEDIUM_TEXT);
  doc.setFontSize(7);
  finalY += 5;

  const notes: string[] = [];
  notes.push("• Presupuesto válido por 30 días desde la fecha de emisión.");
  notes.push("• Los precios incluyen materiales y mano de obra salvo indicación contraria.");
  notes.push("• No incluye trabajos no especificados en las partidas anteriores.");
  notes.push("• Plazo de ejecución a convenir tras la aceptación del presupuesto.");

  if (data.ivaPorcentaje === 10) {
    notes.push("• IVA reducido del 10% aplicado según Art. 91.Uno.2.10.º Ley 37/1992 (reformas de vivienda habitual > 2 años, materiales < 40% del total).");
  }

  if (data.notes) {
    notes.push(`• ${data.notes}`);
  }

  for (const note of notes) {
    doc.text(note, margin, finalY, { maxWidth: contentWidth });
    finalY += 4;
  }

  // === PAGE FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerYPos = pageHeight - 10;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerYPos - 4, pageWidth - margin, footerYPos - 4);

    doc.setFontSize(6.5);
    doc.setTextColor(...LIGHT_TEXT);
    doc.setFont("helvetica", "normal");

    // Left: date
    doc.text(data.date, margin, footerYPos);

    // Center: company name
    doc.text(data.companyName, pageWidth / 2, footerYPos, { align: "center" });

    // Right: page number
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerYPos, { align: "right" });
  }

  // Download
  const filename = `presupuesto-${data.estimateNumber.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  doc.save(filename);
}
