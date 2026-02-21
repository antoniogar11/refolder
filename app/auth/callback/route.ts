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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Auto-crear empresa si es un usuario nuevo (OAuth o invitación)
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (!existingCompany) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Mi Empresa";

          await supabase
            .from("companies")
            .insert({
              owner_id: user.id,
              name: displayName,
            })
            .single();
        }

        // Si hay un parámetro redirectTo en la URL (de invitaciones de Supabase)
        const redirectTo = requestUrl.searchParams.get("redirectTo");

        if (redirectTo) {
          const email = requestUrl.searchParams.get("email");
          if (email) {
            redirect(`/auth/register?email=${encodeURIComponent(email)}`);
          }
          redirect(redirectTo);
        }

        redirect(next);
      }
    }
  }

  // Si hay algún error o no hay código, redirigir al dashboard
  redirect(next);
}
