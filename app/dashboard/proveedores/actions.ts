"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { createClient } from "@/lib/supabase/server";
import { supplierSchema } from "@/lib/validations/supplier";

function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}

export async function createSupplierAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = supplierSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase.from("suppliers").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating supplier", error);
    return { status: "error", message: `No se pudo crear el proveedor: ${error.message}` };
  }

  revalidatePath("/dashboard/proveedores");
  return { status: "success", message: "Proveedor creado correctamente." };
}

export async function updateSupplierAction(
  supplierId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = supplierSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return zodErrorsToFormState(parsed.error.issues);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("suppliers")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", supplierId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating supplier", error);
    return { status: "error", message: `No se pudo actualizar el proveedor: ${error.message}` };
  }

  revalidatePath("/dashboard/proveedores");
  revalidatePath(`/dashboard/proveedores/${supplierId}`);
  return { status: "success", message: "Proveedor actualizado correctamente." };
}

export async function deleteSupplierAction(
  supplierId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", supplierId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting supplier", error);
    return { success: false, message: `No se pudo eliminar el proveedor: ${error.message}` };
  }

  revalidatePath("/dashboard/proveedores");
  return { success: true, message: "Proveedor eliminado correctamente." };
}
