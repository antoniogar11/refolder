import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, presupuestos_mes, herramienta_actual, tiempo_presupuesto, mayor_frustracion, pagaria } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("leads")
      .update({
        presupuestos_mes,
        herramienta_actual,
        tiempo_presupuesto,
        mayor_frustracion,
        pagaria,
      })
      .eq("email", email);

    if (error) {
      console.error("Error Supabase (survey):", error);
      return NextResponse.json(
        { error: "Error al guardar encuesta", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error en /api/survey:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
