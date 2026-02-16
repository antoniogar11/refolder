"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { parseFormData } from "@/lib/forms/parse";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/client";

export async function createClientAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = clientSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase.from("clients").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating client", error);
    return {
      status: "error",
      message: `No se pudo crear el cliente: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/clientes");

  return {
    status: "success",
    message: "Cliente creado correctamente.",
  };
}

export async function updateClientAction(
  clientId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = clientSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating client", error);
    return {
      status: "error",
      message: `No se pudo actualizar el cliente: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${clientId}`);

  return {
    status: "success",
    message: "Cliente actualizado correctamente.",
  };
}

export async function deleteClientAction(
  clientId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting client", error);
    return {
      success: false,
      message: `No se pudo eliminar el cliente: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/clientes");

  return {
    success: true,
    message: "Cliente eliminado correctamente.",
  };
}
