"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { createClient } from "@/lib/supabase/server";
import { estimateSchema } from "@/lib/validations/estimate";

function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}

export async function createEstimateAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = estimateSchema.safeParse(parseFormData(formData));

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

  const { error } = await supabase.from("estimates").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating estimate", error);
    return { status: "error", message: `No se pudo crear el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  return { status: "success", message: "Presupuesto creado correctamente." };
}

export async function updateEstimateAction(
  estimateId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = estimateSchema.safeParse(parseFormData(formData));

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
    .from("estimates")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating estimate", error);
    return { status: "error", message: `No se pudo actualizar el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  revalidatePath(`/dashboard/presupuestos/${estimateId}`);
  return { status: "success", message: "Presupuesto actualizado correctamente." };
}

export async function deleteEstimateAction(
  estimateId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("estimates")
    .delete()
    .eq("id", estimateId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting estimate", error);
    return { success: false, message: `No se pudo eliminar el presupuesto: ${error.message}` };
  }

  revalidatePath("/dashboard/presupuestos");
  return { success: true, message: "Presupuesto eliminado correctamente." };
}
