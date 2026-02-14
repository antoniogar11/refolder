"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/lib/forms/form-state";
import { zodErrorsToFormState } from "@/lib/forms/form-state";
import { createClient } from "@/lib/supabase/server";
import { financeTransactionSchema } from "@/lib/validations/finance";

function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    result[key] = typeof value === "string" ? value.trim() : "";
  });
  return result;
}

export async function createTransactionAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = financeTransactionSchema.safeParse(parseFormData(formData));

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

  const { error } = await supabase.from("finance_transactions").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating transaction", error);
    return { status: "error", message: `No se pudo crear la transacción: ${error.message}` };
  }

  revalidatePath("/dashboard/finanzas");
  return { status: "success", message: "Transacción registrada correctamente." };
}

export async function deleteTransactionAction(
  transactionId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No estás autenticado." };
  }

  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting transaction", error);
    return { success: false, message: `No se pudo eliminar: ${error.message}` };
  }

  revalidatePath("/dashboard/finanzas");
  return { success: true, message: "Transacción eliminada." };
}
