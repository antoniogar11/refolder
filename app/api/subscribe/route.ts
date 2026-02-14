import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, tipo, provincia } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Upsert: si ya existe el email, simplemente actualiza
    const { error } = await supabase.from("leads").upsert(
      {
        email,
        tipo: tipo || null,
        provincia: provincia || null,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Error Supabase:", error);
      return NextResponse.json(
        { error: "Error al registrar", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error en /api/subscribe:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
