"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/validations/company";

function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}

export async function updateCompanyAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = companySchema.safeParse(parseFormData(formData));

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

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!company) {
    return { status: "error", message: "No se encontró la empresa." };
  }

  const { error } = await supabase
    .from("companies")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", company.id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating company", error);
    return { status: "error", message: `No se pudo actualizar: ${error.message}` };
  }

  revalidatePath("/dashboard/configuracion");
  return { status: "success", message: "Datos de empresa actualizados correctamente." };
}
