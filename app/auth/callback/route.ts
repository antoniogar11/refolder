import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Si hay un parámetro redirectTo en la URL (de invitaciones de Supabase)
      const redirectTo = requestUrl.searchParams.get("redirectTo");
      
      if (redirectTo) {
        // Si viene de una invitación, redirigir al registro con el email pre-rellenado
        const email = requestUrl.searchParams.get("email");
        if (email) {
          redirect(`/auth/register?email=${encodeURIComponent(email)}`);
        }
        redirect(redirectTo);
      }
      
      // Verificar si el usuario tiene un email pendiente (invitación)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user?.email) {
        // Si el usuario ya está autenticado, ir al dashboard
        redirect(next);
      }
    }
  }

  // Si hay algún error o no hay código, redirigir al dashboard
  redirect(next);
}
