"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { parseFormData } from "@/lib/forms/parse";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

export async function registerAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues, "Revisa el formulario.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/login`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // Auto-crear empresa para el nuevo usuario
  if (data.user) {
    await supabase
      .from("companies")
      .insert({
        owner_id: data.user.id,
        name: parsed.data.name || "Mi Empresa",
      })
      .single();
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message: "Registro correcto. Revisa tu email para confirmar la cuenta.",
  };
}

export async function loginAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues, "Revisa tus credenciales.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/dashboard");
}

export async function resetPasswordAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email");
  if (!email || typeof email !== "string" || !email.trim()) {
    return { status: "error", message: "Introduce tu email.", errors: { email: ["El email es obligatorio"] } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/update-password`,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
  };
}

export async function updatePasswordAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get("password");
  if (!password || typeof password !== "string" || password.length < 6) {
    return { status: "error", message: "La contraseña debe tener al menos 6 caracteres.", errors: { password: ["Mínimo 6 caracteres"] } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.trim() });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
