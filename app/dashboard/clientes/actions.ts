"use server";

import { revalidatePath } from "next/cache";

import type { ClientFormState } from "@/lib/forms/client-form-state";
import { initialClientFormState } from "@/lib/forms/client-form-state";
import { createClient } from "@/lib/supabase/server";

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

function validateClient(formData: FormData): { data?: ClientPayload; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const emailRaw = (formData.get("email") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const address = (formData.get("address") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";
  const province = (formData.get("province") as string | null)?.trim() ?? "";
  const postalCode = (formData.get("postal_code") as string | null)?.trim() ?? "";
  const taxId = (formData.get("tax_id") as string | null)?.trim() ?? "";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";

  if (!name) {
    errors.name = ["El nombre es obligatorio."];
  }

  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw.toLowerCase())) {
    errors.email = ["Formato de email inválido."];
  }

  if (phone && phone.length < 6) {
    errors.phone = ["El teléfono es demasiado corto."];
  }

  if (postalCode && !/^\d{5}$/.test(postalCode)) {
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
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
  }

  const { error } = await supabase.from("clients").insert({
    ...validation.data!,
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
    return {
      status: "error",
      message: "No estás autenticado. Por favor, inicia sesión.",
    };
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

export async function deleteClientAction(clientId: string): Promise<{ success: boolean; message: string }> {
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

  const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);

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

