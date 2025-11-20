import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getEstimateById } from "@/lib/data/estimates";
import { EstimatePDF } from "@/components/estimates/estimate-pdf";
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

    // Obtener el presupuesto
    const estimate = await getEstimateById(id);

    if (!estimate) {
      return new NextResponse("Presupuesto no encontrado", { status: 404 });
    }

    // Verificar que el presupuesto pertenece al usuario
    if (estimate.user_id !== user.id) {
      return new NextResponse("No autorizado", { status: 403 });
    }

    // Generar el PDF
    const pdfDocument = <EstimatePDF estimate={estimate} />;
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
        "Content-Disposition": `attachment; filename="presupuesto-${estimate.estimate_number}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return new NextResponse("Error al generar el PDF", { status: 500 });
  }
}

