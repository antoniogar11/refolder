"use server";

import { revalidatePath } from "next/cache";

import type { ClientFormState } from "@/lib/forms/client-form-state";
import { initialClientFormState } from "@/lib/forms/client-form-state";
import { createClient } from "@/lib/supabase/server";
import {
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  isNotEmpty,
  getFormDataValue,
} from "@/lib/utils/validation";
import { AppErrors, handleSupabaseError, createErrorResult } from "@/lib/utils/errors";

type ClientPayload = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  tax_id: string | null;
  notes: string | null;
};

/**
 * Valida los datos de un cliente desde FormData
 * @param formData - FormData con los datos del cliente
 * @returns Datos validados o errores de validación
 */
function validateClient(formData: FormData): { data?: ClientPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const name = getFormDataValue(formData, "name");
  const emailRaw = getFormDataValue(formData, "email");
  const phone = getFormDataValue(formData, "phone");
  const address = getFormDataValue(formData, "address");
  const city = getFormDataValue(formData, "city");
  const province = getFormDataValue(formData, "province");
  const postalCode = getFormDataValue(formData, "postal_code");
  const taxId = getFormDataValue(formData, "tax_id");
  const notes = getFormDataValue(formData, "notes");

  if (!isNotEmpty(name)) {
    errors.name = ["El nombre es obligatorio."];
  }

  if (emailRaw && !isValidEmail(emailRaw)) {
    errors.email = ["Formato de email inválido."];
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = ["El teléfono es demasiado corto."];
  }

  if (postalCode && !isValidPostalCode(postalCode)) {
    errors.postal_code = ["El código postal debe tener 5 dígitos."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      email: emailRaw ? emailRaw.toLowerCase() : null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postal_code: postalCode || null,
      tax_id: taxId || null,
      notes: notes || null,
    },
  };
}

export async function createClientAction(_: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const validation = validateClient(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createErrorResult(AppErrors.UNAUTHORIZED.message);
  }

  const { error } = await supabase.from("clients").insert({
    ...validation.data!,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating client", error);
    const appError = handleSupabaseError(error);
    return createErrorResult(`No se pudo crear el cliente: ${appError.message}`);
  }

  revalidatePath("/dashboard/clientes");

  return {
    status: "success",
    message: "Cliente creado correctamente.",
  };
}

export async function updateClientAction(
  clientId: string,
  _: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const validation = validateClient(formData);

  if (validation.errors) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createErrorResult(AppErrors.UNAUTHORIZED.message);
  }

  const { error } = await supabase
    .from("clients")
    .update({
      ...validation.data!,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating client", error);
    const appError = handleSupabaseError(error);
    return createErrorResult(`No se pudo actualizar el cliente: ${appError.message}`);
  }

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${clientId}`);

  return {
    status: "success",
    message: "Cliente actualizado correctamente.",
  };
}

export async function deleteClientAction(clientId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: AppErrors.UNAUTHORIZED.message,
    };
  }

  const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);

  if (error) {
    console.error("Error deleting client", error);
    const appError = handleSupabaseError(error);
    return {
      success: false,
      message: `No se pudo eliminar el cliente: ${appError.message}`,
    };
  }

  revalidatePath("/dashboard/clientes");

  return {
    success: true,
    message: "Cliente eliminado correctamente.",
  };
}

