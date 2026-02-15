import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "No autenticado." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = clientSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() ?? "_";
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json(
      { error: "Datos invalidos.", fieldErrors },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id, name")
    .single();

  if (error) {
    console.error("Error creating client via API:", error);
    return NextResponse.json(
      { error: `No se pudo crear el cliente: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id, name: data.name });
}
