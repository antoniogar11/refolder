"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/lib/auth/types";
import { getAppUrl } from "@/lib/utils/get-app-url";

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

function ensureEnv(): AuthFormState | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      status: "error",
      message: "Faltan las variables de entorno de Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  return null;
}

function validateRegister(formData: FormData): { data?: RegisterData; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!name) {
    errors.name = ["El nombre es obligatorio."];
  } else if (name.length < 3) {
    errors.name = ["El nombre debe tener al menos 3 caracteres."];
  }

  if (!email) {
    errors.email = ["El email es obligatorio."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Formato de email inválido."];
  }

  if (!password) {
    errors.password = ["La contraseña es obligatoria."];
  } else if (password.length < 6) {
    errors.password = ["La contraseña debe tener al menos 6 caracteres."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: { name, email, password },
  };
}

function validateLogin(formData: FormData): { data?: LoginData; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email) {
    errors.email = ["El email es obligatorio."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Formato de email inválido."];
  }

  if (!password) {
    errors.password = ["La contraseña es obligatoria."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return { data: { email, password } };
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const envIssue = ensureEnv();
  if (envIssue) {
    return envIssue;
  }

  const validation = validateRegister(formData);
  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa el formulario.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data!.email,
    password: validation.data!.password,
    options: {
      data: {
        full_name: validation.data!.name,
      },
      emailRedirectTo: `${getAppUrl()}/auth/login`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message: "Registro correcto. Revisa tu email para confirmar la cuenta.",
  };
}

export async function loginAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const envIssue = ensureEnv();
  if (envIssue) {
    return envIssue;
  }

  const validation = validateLogin(formData);
  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa tus credenciales.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data!.email,
    password: validation.data!.password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect("/dashboard");

  return {
    status: "success",
    message: "Sesión iniciada.",
  };
}

export async function logoutAction() {
  const envIssue = ensureEnv();
  if (envIssue) {
    throw new Error(envIssue.message);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

