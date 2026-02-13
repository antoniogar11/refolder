import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, tipo, provincia } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
    }

    const supabase = await createClient();

    // Comprobar si ya existe
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, already_subscribed: true });
    }

    // Insertar nuevo lead
    const { error } = await supabase.from("leads").insert({
      email,
      tipo: tipo || null,
      provincia: provincia || null,
    });

    if (error) {
      console.error("Error al insertar lead:", error);
      return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/subscribe:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
