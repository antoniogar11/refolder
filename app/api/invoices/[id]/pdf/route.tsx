import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceById } from "@/lib/data/invoices";
import { getUserCompany } from "@/lib/data/companies";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { Readable } from "stream";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Obtener la factura
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return new NextResponse("Factura no encontrada", { status: 404 });
    }

    // Verificar que la factura pertenece al usuario o a su empresa
    if (invoice.user_id !== user.id && invoice.company_id) {
      // Verificar permisos de empresa (si aplica)
      const company = await getUserCompany();
      if (!company || company.id !== invoice.company_id) {
        return new NextResponse("No autorizado", { status: 403 });
      }
    }

    // Obtener datos de la empresa
    const company = await getUserCompany();

    // Generar el PDF
    const pdfDocument = <InvoicePDF invoice={invoice} company={company} />;
    const stream = await renderToStream(pdfDocument);

    // Convertir el stream de Node.js a ReadableStream para Next.js
    const chunks: Buffer[] = [];
    const nodeStream = Readable.from(stream);
    
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    // Retornar el PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factura-${invoice.invoice_number}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return new NextResponse("Error al generar el PDF", { status: 500 });
  }
}

